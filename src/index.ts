import fetch from 'isomorphic-unfetch';
import qs from 'query-string';

import type {
  KeyString,
  SmartPayOptions,
  ChekoutSessionPayload,
  RefundPayload,
  CheckoutSession,
  Order,
  Payment,
  Refund,
  Result,
  ChekoutSessionPayloadFlat,
} from './types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  isValidOrderId,
  isValidPaymentId,
  isValidCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  errorObj,
  errorResult,
  jtdErrorToDetail,
} from './utils.js';

const API_PREFIX = 'https://api.smartpay.co/smartpayments/';
const CHECKOUT_URL = 'https://checkout.smartpay.ninja';

const POST = 'POST';
// const PUT = 'PUT';
// const DELETE = 'DELETE';

export const STATUS_SUCCEEDED = 'succeeded';
export const STATUS_REJECTED = 'rejected';
export const STATUS_FAILED = 'failed';
export const STATUS_REQUIRES_AUTHORIZATION = 'requires_authorization';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

class Smartpay {
  _secretKey: KeyString;
  _publicKey?: KeyString;
  _apiPrefix: string;
  _checkoutURL: string;

  constructor(key: KeyString, options: SmartPayOptions = {}) {
    if (!key) {
      throw new Error('Secret API Key is required.');
    }

    if (!isValidSecretApiKey(key)) {
      throw new Error('Secret API Key is invalid.');
    }

    if (options.publicKey && !isValidPublicApiKey(options.publicKey)) {
      throw new Error('Public API Key is invalid.');
    }

    this._secretKey = key;
    this._publicKey = options.publicKey;
    this._apiPrefix = options.apiPrefix || API_PREFIX;
    this._checkoutURL = options.checkoutURL || CHECKOUT_URL;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request(endpoint: string, method: Method = 'GET', payload?: any) {
    return fetch(`${this._apiPrefix}${endpoint}`, {
      method,
      headers: {
        Authorization: `Basic ${this._secretKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : null,
    })
      .then((response) => {
        return response
          .json()
          .then((data) => {
            return response.ok
              ? {
                  statusCode: response.status,
                  data,
                }
              : {
                  statusCode: response.status,
                  error: {
                    errorCode: data.errorCode,
                    message: data.message,
                    details: data.details,
                  },
                };
          })
          .catch(() => ({
            statusCode: response.status,
            error: {
              errorCode: 'unexpected_error',
              message: '',
            },
          }));
      })
      .catch((error) => ({
        statusCode: -1,
        error: {
          errorCode: 'unexpected_error',
          message: error.message,
        },
      }));
  }

  static normalizeCheckoutSessionPayload(payload: ChekoutSessionPayloadFlat) {
    const normalizedPayload = normalizeCheckoutSessionPayload(payload);
    const errors = isValidCheckoutSessionPayload(
      normalizedPayload as ChekoutSessionPayload
    );

    if (errors.length) {
      return {
        error: errorObj(
          'request.invalid',
          'Payload invalid',
          jtdErrorToDetail(errors, 'payload')
        ),
      };
    }

    return {
      data: normalizedPayload,
    };
  }

  createCheckoutSession(payload: ChekoutSessionPayloadFlat) {
    const { data: normalizedPayload, error } =
      Smartpay.normalizeCheckoutSessionPayload(payload);

    if (error) {
      return Promise.resolve({
        error,
      });
    }

    // Call API to create checkout session
    const req: Promise<Result<CheckoutSession>> = this.request(
      '/checkout/sessions',
      POST,
      normalizedPayload
    );

    return req.then((result) => {
      const session = result.data;

      if (session) {
        const sessionURLResult = this.getSessionURL(session);

        if (sessionURLResult.data) {
          session.checkoutURL = sessionURLResult.data;
        }
      }

      return result;
    });
  }

  isOrderAuthorized(orderId: string): Promise<Result<boolean>> {
    return this.getOrder(orderId).then((result) => {
      const order = result.data;

      if (order) {
        return { ...result, data: order.status === STATUS_SUCCEEDED };
      }

      return { ...result, data: undefined };
    });
  }

  getOrder(orderId: string): Promise<Result<Order>> {
    if (!isValidOrderId(orderId)) {
      return errorResult('request.invalid', 'Order ID is invalid');
    }

    return this.request(`/orders/${orderId}`);
  }

  getPayments(orderId: string): Promise<Result<Payment[]>> {
    if (!isValidOrderId(orderId)) {
      return errorResult('request.invalid', 'Order ID is invalid');
    }

    return this.request(`/orders/${orderId}/payments`);
  }

  getPayment(paymentId: string): Promise<Result<Payment>> {
    if (!isValidPaymentId(paymentId)) {
      return errorResult('request.invalid');
    }

    return this.request(`/payments/${paymentId}`);
  }

  refundPayment(payload: RefundPayload): Promise<Result<Refund>> {
    const { payment, currency } = payload;

    if (!payment) {
      return errorResult('request.invalid', 'Payload invalid', [
        'payload.payment is required',
      ]);
    }

    if (!isValidPaymentId(payment)) {
      return errorResult('request.invalid', 'Payload invalid', [
        'payload.payment is invalid',
      ]);
    }

    if (!currency) {
      return errorResult('request.invalid', 'Payload invalid', [
        'payload.currency is invalid',
      ]);
    }

    return this.request(`/refunds/`, POST, payload);
  }

  setPublicKey(publicKey: KeyString) {
    if (!publicKey) {
      return errorObj('request.invalid');
    }

    if (!isValidPublicApiKey(publicKey)) {
      return errorObj('request.invalid', 'Public Key is required');
    }

    this._publicKey = publicKey;

    return {};
  }

  getSessionURL(session: CheckoutSession): Result<string> {
    if (!session) {
      return errorObj('request.invalid', 'Session is invalid');
    }

    if (!this._publicKey) {
      return errorObj('request.invalid', 'Public Key is required');
    }

    const params = {
      session: session.id,
      key: this._publicKey,
    };

    return {
      data: qs.stringifyUrl({
        url: `${this._checkoutURL}/login`,
        query: params,
      }),
    };
  }
}

export default Smartpay;
