import fetchRetry from 'fetch-retry';
import originalFetch from 'isomorphic-unfetch';
import qs from 'query-string';
import randomstring from 'randomstring';

import { KeyString, SmartPayOptions } from '../types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  SmartpayError,
} from '../utils';

const fetch = fetchRetry(originalFetch, {
  retries: 1,
  retryOn: [500, 501, 502, 503, 504],
  retryDelay: (attempt: number) => {
    return 2 ** attempt * 200;
  },
});

export interface Params {
  [key: string]: string | number;
}

const API_PREFIX = 'https://api.smartpay.co/v1';
const CHECKOUT_URL = 'https://checkout.smartpay.co';

export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const PATCH = 'PATCH';
export const DELETE = 'DELETE';

// eslint-disable-next-line prefer-destructuring
const SMARTPAY_API_PREFIX =
  process.env.SMARTPAY_API_PREFIX?.toLowerCase()?.includes('api.smartpay')
    ? process.env.SMARTPAY_API_PREFIX
    : '';

// eslint-disable-next-line prefer-destructuring
const SMARTPAY_CHECKOUT_URL = process.env.SMARTPAY_CHECKOUT_URL;

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor = new (...args: any[]) => SmartpayBase;

class SmartpayBase {
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

  request(
    endpoint: string,
    options: {
      method?: Method;
      params?: Params;
      payload?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
          switch (response.status) {
            case 204:
              return Promise.resolve('');
            default:
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
          }
        })
    );
  }

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
}

export default SmartpayBase;
