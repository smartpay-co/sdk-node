import fetch from 'isomorphic-unfetch';
import qs from 'query-string';

import {
  KeyString,
  SmartPayOptions,
  CheckoutSession,
  SimpleChekoutSessionPayload,
  Payment,
  Refund,
  Order,
  GetOrdersParams,
  GetOrderParams,
  CreatePaymentParams,
  GetPaymentParams,
  CreateRefundParams,
  GetRefundParams,
  OrdersCollection,
} from './types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  validateCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  omit,
  jtdErrorToDetails,
  SmartpayError,
} from './utils';

interface Params {
  [key: string]: string;
}

const API_PREFIX = 'https://api.smartpay.co/v1';
const CHECKOUT_URL = 'https://checkout.smartpay.co';

const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
// const DELETE = 'DELETE';

export const STATUS_SUCCEEDED = 'succeeded';
export const STATUS_REJECTED = 'rejected';
export const STATUS_FAILED = 'failed';
export const STATUS_REQUIRES_AUTHORIZATION = 'requires_authorization';

// eslint-disable-next-line prefer-destructuring
const SMARTPAY_API_PREFIX =
  process.env.SMARTPAY_API_PREFIX?.toLowerCase()?.includes('api.smartpay')
    ? process.env.SMARTPAY_API_PREFIX
    : '';

// eslint-disable-next-line prefer-destructuring
const SMARTPAY_CHECKOUT_URL = process.env.SMARTPAY_CHECKOUT_URL;

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type GetSessionURLOptions = {
  checkoutURL?: string;
  promotionCode?: string;
};

type SessionURLParams = {
  'promotion-code'?: string;
};

class Smartpay {
  static REJECT_REQUEST_BY_CUSTOMER = 'requested_by_customer';
  static REJECT_FRAUDULENT = 'fraudulent';

  _secretKey: KeyString;
  _publicKey?: KeyString;
  _apiPrefix: string;
  _checkoutURL: string;

  constructor(key: KeyString, options: SmartPayOptions = {}) {
    if (!key) {
      throw new Error('Secret Key is required.');
    }

    if (!isValidSecretApiKey(key)) {
      throw new Error('Secret Key is invalid.');
    }

    if (options.publicKey && !isValidPublicApiKey(options.publicKey)) {
      throw new Error('Public Key is invalid.');
    }

    this._secretKey = key;
    this._publicKey = options.publicKey;
    this._apiPrefix = options.apiPrefix || SMARTPAY_API_PREFIX || API_PREFIX;
    this._checkoutURL =
      options.checkoutURL || SMARTPAY_CHECKOUT_URL || CHECKOUT_URL;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request(
    endpoint: string,
    options: {
      method?: Method;
      params?: Params;
      payload?: any;
    } = {}
  ) {
    const { method, params, payload } = options;

    let url = `${this._apiPrefix}${endpoint}`;

    if (params) {
      url = `${url}?${qs.stringify(params)}`;
    }

    return (
      fetch(url, {
        method: method || GET,
        headers: {
          Authorization: `Basic ${this._secretKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : null,
      })
        // Netowork issue
        .catch((error) => {
          throw new SmartpayError({
            errorCode: 'unexpected_error',
            statusCode: -1,
            message: error.message,
          });
        })
        .then((response) => {
          return (
            response
              .json()
              // Parse body failed
              .catch((error) => {
                throw new SmartpayError({
                  errorCode: 'unexpected_error',
                  statusCode: response.status,
                  message: `${response.status} ${error.message}`,
                });
              })
              .then((data) => {
                if (response.ok) {
                  return data;
                }

                throw new SmartpayError({
                  errorCode: data.errorCode,
                  statusCode: response.status,
                  message: `${response.status} ${data.message}`,
                  details: data.details,
                });
              })
          );
        })
    );
  }

  static normalizeCheckoutSessionPayload(
    payload: SimpleChekoutSessionPayload
  ): SimpleChekoutSessionPayload {
    const normalizedPayload = normalizeCheckoutSessionPayload(payload);
    const errors = validateCheckoutSessionPayload(
      normalizedPayload as SimpleChekoutSessionPayload
    );

    if (errors.length) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Payload invalid',
        details: jtdErrorToDetails(errors, 'payload'),
      });
    }

    return normalizedPayload;
  }

  createCheckoutSession(payload: SimpleChekoutSessionPayload) {
    const normalizedPayload = Smartpay.normalizeCheckoutSessionPayload(payload);

    const params = {
      'dev-lang': 'nodejs',
      'sdk-version': '__buildVersion__',
    };

    // Call API to create checkout session
    const req: Promise<CheckoutSession> = this.request(
      `/checkout-sessions?${qs.stringify(params)}`,
      {
        method: POST,
        payload: normalizedPayload,
      }
    );

    return req.then((session) => {
      if (session) {
        const sessionURL = Smartpay.getSessionURL(session, {
          promotionCode: payload.promotionCode,
        });

        if (sessionURL) {
          // eslint-disable-next-line no-param-reassign
          session.url = sessionURL;
        }
      }

      return session;
    });
  }

  getOrders(params: GetOrdersParams = {}) {
    const req: Promise<OrdersCollection> = this.request(
      `/orders?${qs.stringify(params)}`,
      {
        method: GET,
      }
    );

    return req;
  }

  getOrder(params: GetOrderParams = {}) {
    const { id } = params;

    if (!id) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is required',
      });
    }

    const req: Promise<Order> = this.request(
      `/orders/${id}?${qs.stringify(omit(params, ['id']))}`,
      {
        method: GET,
      }
    );

    return req;
  }

  cancelOrder(params: GetOrderParams = {}) {
    const { id } = params;

    if (!id) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is required',
      });
    }

    const req: Promise<Order> = this.request(
      `/orders/${id}/cancellation?${qs.stringify(omit(params, ['id']))}`,
      {
        method: PUT,
      }
    );

    return req;
  }

  createPayment(params: CreatePaymentParams = {}) {
    const { order, amount, currency } = params;

    if (!order) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is required',
      });
    }

    if (!amount) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Capture Amount is required',
      });
    }

    if (!currency) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Capture Amount Currency is required',
      });
    }

    const req: Promise<Payment> = this.request(`/payments`, {
      method: POST,
      payload: params,
    });

    return req;
  }

  capture(params: CreatePaymentParams = {}) {
    return this.createPayment(params);
  }

  getPayment(params: GetPaymentParams = {}) {
    const { id } = params;

    if (!id) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Payment Id is required',
      });
    }

    const req: Promise<Payment> = this.request(
      `/payments/${id}?${qs.stringify(omit(params, ['id']))}`,
      {
        method: GET,
      }
    );

    return req;
  }

  createRefund(params: CreateRefundParams = {}) {
    const { payment, amount, currency, reason } = params;

    if (!payment) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Payment Id is required',
      });
    }

    if (!amount) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Refund Amount is required',
      });
    }

    if (!currency) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Refund Amount Currency is required',
      });
    }

    if (!reason) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Refund Reason is required',
      });
    }

    const req: Promise<Refund> = this.request(`/refunds`, {
      method: POST,
      payload: params,
    });

    return req;
  }

  refund(params: CreateRefundParams = {}) {
    return this.createRefund(params);
  }

  getRefund(params: GetRefundParams = {}) {
    const { id } = params;

    if (!id) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Refund Id is required',
      });
    }

    const req: Promise<Refund> = this.request(
      `/refunds/${id}?${qs.stringify(omit(params, ['id']))}`,
      {
        method: GET,
      }
    );

    return req;
  }

  /**
   * refundOrder will automatically find payments in the order and create refund
   * one by one until amount are all refunded.
   */
  // refundOrder() {}

  setPublicKey(publicKey: KeyString) {
    if (!publicKey) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Public Key is required',
      });
    }

    if (!isValidPublicApiKey(publicKey)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Public Key is invalid',
      });
    }

    this._publicKey = publicKey;

    return {};
  }

  static getSessionURL(
    session: CheckoutSession,
    options?: GetSessionURLOptions
  ): string {
    if (!session) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Session is invalid',
      });
    }

    const checkoutURL = session.url;
    const params: SessionURLParams = {
      'promotion-code': options?.promotionCode,
    };

    return qs.stringifyUrl({
      url: checkoutURL,
      query: params,
    });
  }
}

export default Smartpay;
