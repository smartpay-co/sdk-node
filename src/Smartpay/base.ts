import fetchRetry from 'fetch-retry';
import originalFetch from 'isomorphic-unfetch';
import qs from 'query-string';
import randomstring from 'randomstring';

import {
  KeyString,
  SmartPayOptions,
  CheckoutSession,
  SimpleChekoutSessionPayload,
} from '../types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  validateCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  omit,
  jtdErrorToDetails,
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
export const DELETE = 'DELETE';

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
    const normalizedPayload =
      SmartpayBase.normalizeCheckoutSessionPayload(payload);

    // Call API to create checkout session
    const req: Promise<CheckoutSession> = this.request(`/checkout-sessions`, {
      method: POST,
      idempotencyKey: payload.idempotencyKey,
      payload: omit(normalizedPayload, ['idempotencyKey']),
    });

    return req.then((session) => {
      if (session) {
        const sessionURL = SmartpayBase.getSessionURL(session, {
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
}

export default SmartpayBase;
