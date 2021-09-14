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
  ChekoutSessionPayloadFlat,
} from './types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  isValidOrderID,
  isValidPaymentID,
  isValidCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  jtdErrorToDetails,
  SmartError,
} from './utils';

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
    return (
      fetch(`${this._apiPrefix}${endpoint}`, {
        method,
        headers: {
          Authorization: `Basic ${this._secretKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : null,
      })
        .then((response) => {
          return (
            response
              .json()
              // Parse body failed
              .catch(() => {
                throw new SmartError({
                  errorCode: 'unexpected_error',
                  statusCode: response.status,
                });
              })
              .then((data) => {
                if (response.ok) {
                  return data;
                }

                throw new SmartError({
                  errorCode: data.errorCode,
                  statusCode: response.status,
                  message: data.message,
                  details: data.details,
                });
              })
          );
        })
        // Netowork issue
        .catch((error) => {
          throw new SmartError({
            errorCode: 'unexpected_error',
            statusCode: -1,
            message: error.message,
          });
        })
    );
  }

  static normalizeCheckoutSessionPayload(
    payload: ChekoutSessionPayloadFlat
  ): ChekoutSessionPayload {
    const normalizedPayload = normalizeCheckoutSessionPayload(payload);
    const errors = isValidCheckoutSessionPayload(
      normalizedPayload as ChekoutSessionPayload
    );

    if (errors.length) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Payload invalid',
        details: jtdErrorToDetails(errors, 'payload'),
      });
    }

    return normalizedPayload;
  }

  createCheckoutSession(payload: ChekoutSessionPayloadFlat) {
    const normalizedPayload = Smartpay.normalizeCheckoutSessionPayload(payload);

    // Call API to create checkout session
    const req: Promise<CheckoutSession> = this.request(
      '/checkout/sessions',
      POST,
      normalizedPayload
    );

    return req.then((session) => {
      if (session) {
        const sessionURL = this.getSessionURL(session);

        if (sessionURL) {
          // eslint-disable-next-line no-param-reassign
          session.checkoutURL = sessionURL;
        }
      }

      return session;
    });
  }

  isOrderAuthorized(orderId: string): Promise<boolean> {
    return this.getOrder(orderId).then(
      (order) => order.status === STATUS_SUCCEEDED
    );
  }

  getOrder(orderId: string): Promise<Order> {
    if (!isValidOrderID(orderId)) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Order ID is invalid',
      });
    }

    return this.request(`/orders/${orderId}`);
  }

  getPayments(orderId: string): Promise<Payment[]> {
    if (!isValidOrderID(orderId)) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Order ID is invalid',
      });
    }

    return this.request(`/orders/${orderId}/payments`);
  }

  getPayment(paymentId: string): Promise<Payment> {
    if (!isValidPaymentID(paymentId)) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Payment ID is invalid',
      });
    }

    return this.request(`/payments/${paymentId}`);
  }

  refundPayment(payload: RefundPayload): Promise<Refund> {
    const { payment, currency } = payload;

    if (!payment) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Payload invalid',
        details: ['payload.payment is required'],
      });
    }

    if (!isValidPaymentID(payment)) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Payload invalid',
        details: ['payload.payment is invalid'],
      });
    }

    if (!currency) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Payload invalid',
        details: ['payload.currency is invalid'],
      });
    }

    return this.request(`/refunds/`, POST, payload);
  }

  setPublicKey(publicKey: KeyString) {
    if (!publicKey) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Public Key is required',
      });
    }

    if (!isValidPublicApiKey(publicKey)) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Public Key is invalid',
      });
    }

    this._publicKey = publicKey;

    return {};
  }

  getSessionURL(session: CheckoutSession): string {
    if (!session) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Session is invalid',
      });
    }

    if (!this._publicKey) {
      throw new SmartError({
        errorCode: 'request.invalid',
        message: 'Public Key is required',
      });
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
