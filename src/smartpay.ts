import fetch from 'isomorphic-unfetch';
import qs from 'query-string';

import {
  KeyString,
  SmartPayOptions,
  ChekoutSessionPayload,
  CheckoutSession,
  ChekoutSessionPayloadFlat,
} from './types';
import {
  isValidPublicApiKey,
  isValidSecretApiKey,
  validateCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  jtdErrorToDetails,
  SmartError,
} from './utils';

interface Params {
  [key: string]: string;
}

const API_PREFIX = 'https://api.smartpay.co/v1';
const CHECKOUT_URL = 'https://checkout.smartpay.co';

const GET = 'GET';
const POST = 'POST';
// const PUT = 'PUT';
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

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

class Smartpay {
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
    this._checkoutURL = options.checkoutURL || CHECKOUT_URL;
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
          throw new SmartError({
            errorCode: 'unexpected_error',
            statusCode: -1,
            message: error.message,
          });
        })
        .then((response) => {
          if (!response.ok) {
            throw new SmartError({
              errorCode: 'unexpected_error',
              statusCode: response.status,
              message: `${response.status}`,
            });
          }

          return (
            response
              .json()
              // Parse body failed
              .catch((error) => {
                throw new SmartError({
                  errorCode: 'unexpected_error',
                  statusCode: response.status,
                  message: `${response.status} ${error.message}`,
                });
              })
              .then((data) => {
                if (response.ok) {
                  return data;
                }

                throw new SmartError({
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
    payload: ChekoutSessionPayloadFlat
  ): ChekoutSessionPayload {
    const normalizedPayload = normalizeCheckoutSessionPayload(payload);
    const errors = validateCheckoutSessionPayload(
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
        const sessionURL = this.getSessionURL(session);

        if (sessionURL) {
          // eslint-disable-next-line no-param-reassign
          session.checkoutURL = sessionURL;
        }
      }

      return session;
    });
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
      'session-id': session.id,
      'public-key': this._publicKey,
    };

    return qs.stringifyUrl({
      url: `${this._checkoutURL}/login`,
      query: params,
    });
  }
}

export default Smartpay;
