import fetch from 'isomorphic-unfetch';
import qs from 'query-string';

import type {
  KeyString,
  SmartPayOptions,
  ChekoutSessionPayload,
  CheckoutSessionResult,
  Order,
} from './types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  isValidCheckoutPayload,
  normalizeCheckoutPayload,
} from './utils.js';

const API_PREFIX = 'https://api.smartpay.co/checkout';
const CHECKOUT_URL = 'https://checkout.smartpay.ninja';

const POST = 'POST';
// const PUT = 'PUT';
// const DELETE = 'DELETE';

export const STATUS_SUCCEEDED = 'succeeded';

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
        Authorization: `Bearer ${this._secretKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : null,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    });
  }

  createCheckoutSession(
    payload: ChekoutSessionPayload
  ): Promise<CheckoutSessionResult> {
    if (!isValidCheckoutPayload(payload)) {
      throw new Error('Checkout Payload is invalid.');
    }

    // Call API to create checkout session
    return this.request(
      '/sessions',
      POST,
      normalizeCheckoutPayload(payload)
    ).then((session) => {
      // eslint-disable-next-line no-param-reassign
      session.checkoutURL = this.getSessionURL(session);

      return session;
    });
  }

  isOrderAuthorized(orderId: string): Promise<boolean> {
    return this.getOrder(orderId).then(
      (order) => order.status === STATUS_SUCCEEDED
    );
  }

  getOrders(): Promise<Order[]> {
    return this.request('/orders');
  }

  getOrder(orderId: string): Promise<Order> {
    return this.request(`/orders/${orderId}`);
  }

  // captureOrder(orderId: string, amount: number) {
  //   return this.request(`/orders/${orderId}/capture`, POST, { amount });
  // }

  refundOrder(orderId: string, amount: number) {
    return this.request(`/orders/${orderId}/refund`, POST, { amount });
  }

  // cancelOrder(orderId: string) {
  //   return this.request(`/orders/${orderId}/cancel`, POST);
  // }

  setPublicKey(publicKey: KeyString) {
    if (!publicKey) {
      throw new Error('Public API Key is required.');
    }

    if (!isValidPublicApiKey(publicKey)) {
      throw new Error('Public API Key is invalid.');
    }

    this._publicKey = publicKey;
  }

  getSessionURL(session: CheckoutSessionResult): string {
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
