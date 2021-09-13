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
        if (!response.ok) {
          return response.json().then((data) => ({
            status: response.status,
            error: {
              message: response.statusText,
              code: '',
            },
            data,
          }));
        }

        return response.json().then((data) => ({
          status: response.status,
          data,
        }));
      })
      .catch((error) => ({
        status: -1,
        error: {
          message: error.message,
          code: '',
        },
      }));
  }

  createCheckoutSession(payload: ChekoutSessionPayloadFlat) {
    const normalizedPayload = normalizeCheckoutSessionPayload(payload);
    const errors = isValidCheckoutSessionPayload(
      normalizedPayload as ChekoutSessionPayload
    );

    if (errors.length) {
      return Promise.resolve({
        error: {
          message: 'Payload Malformed',
          code: 'payload_malformed',
        },
      });
    }

    // Call API to create checkout session
    const req: Promise<Result<CheckoutSession>> = this.request(
      '/checkout/sessions',
      POST,
      normalizedPayload
    );

    return req.then((result) => {
      if (result.data) {
        // eslint-disable-next-line no-param-reassign
        result.data.checkoutURL = this.getSessionURL(result.data);
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
      throw new Error('Order ID is invalid.');
    }

    return this.request(`/orders/${orderId}`);
  }

  getPayments(orderId: string): Promise<Result<Payment[]>> {
    if (!isValidOrderId(orderId)) {
      throw new Error('Order ID is invalid.');
    }

    return this.request(`/orders/${orderId}/payments`);
  }

  getPayment(paymentId: string): Promise<Result<Payment>> {
    if (!isValidPaymentId(paymentId)) {
      throw new Error('Payment ID is invalid.');
    }

    return this.request(`/payments/${paymentId}`);
  }

  refundPayment(payload: RefundPayload): Promise<Result<Refund>> {
    const { payment, currency } = payload;

    if (!payment) {
      throw new Error('Payment ID(payment) is required.');
    }

    if (!isValidPaymentId(payment)) {
      throw new Error('Payment ID is invalid.');
    }

    if (!currency) {
      throw new Error('Currency is required.');
    }

    return this.request(`/refunds/`, POST, payload);
  }

  setPublicKey(publicKey: KeyString) {
    if (!publicKey) {
      throw new Error('Public API Key is required.');
    }

    if (!isValidPublicApiKey(publicKey)) {
      throw new Error('Public API Key is invalid.');
    }

    this._publicKey = publicKey;
  }

  getSessionURL(session: CheckoutSession): string {
    if (!session) {
      throw new Error('Checkout Session is required.');
    }

    if (!this._publicKey) {
      throw new Error('Public API Key is required.');
    }

    const params = {
      session: session.id,
      key: this._publicKey,
    };

    return qs.stringifyUrl({
      url: `${this._checkoutURL}/login`,
      query: params,
    });
  }
}

export default Smartpay;
