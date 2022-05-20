import { createHmac } from 'crypto';

import basex from 'base-x';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request, Response } from 'express';
import fetchRetry from 'fetch-retry';
import originalFetch from 'isomorphic-unfetch';
import qs from 'query-string';
import randomstring from 'randomstring';

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
  CancelOrderParams,
  CreatePaymentParams,
  GetPaymentParams,
  CreateRefundParams,
  GetRefundParams,
  OrdersCollection,
  CalculateWebhookSignatureParams,
  VerifyWebhookSignatureParams,
} from './types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  isValidOrderId,
  isValidPaymentId,
  isValidRefundId,
  validateCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  omit,
  jtdErrorToDetails,
  SmartpayError,
} from './utils';

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const base62 = basex(BASE62);

const fetch = fetchRetry(originalFetch, {
  retries: 1,
  retryOn: [500, 501, 502, 503, 504],
  retryDelay: (attempt: number) => {
    return 2 ** attempt * 200;
  },
});

interface Params {
  [key: string]: string | number;
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
export const STATUS_CANCELED = 'canceled';

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
      idempotencyKey?: string;
    } = {}
  ) {
    const {
      method,
      params,
      payload,
      idempotencyKey: customIdempotencyKey,
    } = options;
    const idempotencyKey = customIdempotencyKey || randomstring.generate();
    const url = qs.stringifyUrl({
      url: `${this._apiPrefix}${endpoint}`,
      query: {
        ...params,
        'dev-lang': 'nodejs',
        'sdk-version': '__buildVersion__',
      },
    });

    return (
      fetch(url, {
        method: method || GET,
        headers: {
          Authorization: `Basic ${this._secretKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
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

    // Call API to create checkout session
    const req: Promise<CheckoutSession> = this.request(`/checkout-sessions`, {
      method: POST,
      idempotencyKey: payload.idempotencyKey,
      payload: omit(normalizedPayload, ['idempotencyKey']),
    });

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
    const req: Promise<OrdersCollection> = this.request(`/orders`, {
      method: GET,
      params,
    });

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

    if (!isValidOrderId(id)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is invalid',
      });
    }

    const req: Promise<Order> = this.request(`/orders/${id}`, {
      method: GET,
      params: omit(params, ['id']),
    });

    return req;
  }

  cancelOrder(params: CancelOrderParams = {}) {
    const { id } = params;

    if (!id) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is required',
      });
    }

    if (!isValidOrderId(id)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is invalid',
      });
    }

    const req: Promise<Order> = this.request(`/orders/${id}/cancellation`, {
      method: PUT,
      params: omit(params, ['id']),
      idempotencyKey: params.idempotencyKey,
    });

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

    if (!isValidOrderId(order)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Order Id is invalid',
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
      idempotencyKey: params.idempotencyKey,
      payload: omit(params, ['idempotencyKey']),
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

    if (!isValidPaymentId(id)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Payment Id is invalid',
      });
    }

    const req: Promise<Payment> = this.request(`/payments/${id}`, {
      method: GET,
      params: omit(params, ['id']),
    });

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

    if (!isValidPaymentId(payment)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Payment Id is invalid',
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
      idempotencyKey: params.idempotencyKey,
      payload: omit(params, ['idempotencyKey']),
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

    if (!isValidRefundId(id)) {
      throw new SmartpayError({
        errorCode: 'request.invalid',
        message: 'Refund Id is invalid',
      });
    }

    const req: Promise<Refund> = this.request(`/refunds/${id}`, {
      method: GET,
      params: omit(params, ['id']),
    });

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

  static getSessionUrl(
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

  // Backward compatiable method
  static getSessionURL(
    session: CheckoutSession,
    options?: GetSessionURLOptions
  ): string {
    return this.getSessionUrl(session, options);
  }

  static calculateWebhookSignature(params: CalculateWebhookSignatureParams) {
    const { data, secret } = params;
    const signer = createHmac('sha256', Buffer.from(base62.decode(secret)));
    const result = signer.update(Buffer.from(data, 'utf8')).digest('hex');

    return result;
  }

  static verifyWebhookSignature(params: VerifyWebhookSignatureParams) {
    const { data, signature, secret } = params;
    const calculatedSignature = Smartpay.calculateWebhookSignature({
      data,
      secret,
    });

    return signature === calculatedSignature;
  }

  static expressWebhookMiddleware(secret: string | Function) {
    return (req: Request, res: Response, buf: Buffer) => {
      if (req.headers['smartpay-signature']) {
        const subscriptionId = req.headers['smartpay-subscription-id'];
        const signingSecret =
          typeof secret === 'string' ? secret : secret(subscriptionId);
        const signer = createHmac(
          'sha256',
          Buffer.from(base62.decode(signingSecret))
        );
        const signatureTimestamp = req.headers['smartpay-signature-timestamp'];
        const result = signer
          .update(Buffer.from(`${signatureTimestamp}.`, 'utf8'))
          .update(buf)
          .digest('hex');

        req.headers['calculated-signature'] = result; // eslint-disable-line no-param-reassign
      }
    };
  }
}

export default Smartpay;
