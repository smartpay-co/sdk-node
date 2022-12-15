import qs from 'query-string';

import {
  CheckoutSession,
  SimpleChekoutSessionPayload,
  TokenChekoutSessionPayload,
  ListParams,
  GetObjectParams,
  Collection,
} from '../types';
import {
  isValidCheckoutSessionId,
  validateCheckoutSessionPayload,
  validateTokenCheckoutSessionPayload,
  normalizeCheckoutSessionPayload,
  jtdErrorToDetails,
  omit,
  SmartpayError,
} from '../utils';

import { GET, POST, Constructor } from './base';

type GetSessionURLOptions = {
  checkoutURL?: string;
  promotionCode?: string;
};

type SessionURLParams = {
  'promotion-code'?: string;
};

export const ADDRESS_TYPE_HOME = 'home';
export const ADDRESS_TYPE_GIFT = 'gift';
export const ADDRESS_TYPE_LOCKER = 'locker';
export const ADDRESS_TYPE_OFFICE = 'office';
export const ADDRESS_TYPE_STORE = 'store';

export const CAPTURE_METHOD_AUTOMATIC = 'autommatic';
export const CAPTURE_METHOD_MANUAL = 'manual';

export const MODE_TOKEN = 'token';

const checkoutSessionsMixin = <T extends Constructor>(Base: T) => {
  class SmartpayWithCheckoutSession extends Base {
    static ADDRESS_TYPE_HOME = ADDRESS_TYPE_HOME;
    static ADDRESS_TYPE_GIFT = ADDRESS_TYPE_GIFT;
    static ADDRESS_TYPE_LOCKER = ADDRESS_TYPE_LOCKER;
    static ADDRESS_TYPE_OFFICE = ADDRESS_TYPE_OFFICE;
    static ADDRESS_TYPE_STORE = ADDRESS_TYPE_STORE;

    static CAPTURE_METHOD_AUTOMATIC = CAPTURE_METHOD_AUTOMATIC;
    static CAPTURE_METHOD_MANUAL = CAPTURE_METHOD_MANUAL;

    static normalizeNormalCheckoutSessionPayload(
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

    static normalizeTokenCheckoutSessionPayload(
      payload: TokenChekoutSessionPayload
    ): TokenChekoutSessionPayload {
      const errors = validateTokenCheckoutSessionPayload(payload);

      if (errors.length) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payload invalid',
          details: jtdErrorToDetails(errors, 'payload'),
        });
      }

      return payload;
    }

    static normalizeCheckoutSessionPayload(
      payload: SimpleChekoutSessionPayload
    ) {
      if (payload.mode === MODE_TOKEN) {
        return SmartpayWithCheckoutSession.normalizeTokenCheckoutSessionPayload(
          payload as TokenChekoutSessionPayload
        );
      }

      return SmartpayWithCheckoutSession.normalizeNormalCheckoutSessionPayload(
        payload
      );
    }

    createCheckoutSession(payload: SimpleChekoutSessionPayload) {
      if (payload.mode === MODE_TOKEN) {
        return this.createTokenCheckoutSession(
          payload as TokenChekoutSessionPayload
        );
      }

      return this.createNormalCheckoutSession(payload);
    }

    createTokenCheckoutSession(payload: TokenChekoutSessionPayload) {
      const req: Promise<CheckoutSession> = this.request(`/checkout-sessions`, {
        method: POST,
        idempotencyKey: payload.idempotencyKey,
        payload: omit(payload, ['idempotencyKey']),
      });

      return req;
    }

    createNormalCheckoutSession(payload: SimpleChekoutSessionPayload) {
      const normalizedPayload =
        SmartpayWithCheckoutSession.normalizeNormalCheckoutSessionPayload(
          payload
        );

      // Call API to create checkout session
      const req: Promise<CheckoutSession> = this.request(`/checkout-sessions`, {
        method: POST,
        idempotencyKey: payload.idempotencyKey,
        payload: omit(normalizedPayload, ['idempotencyKey']),
      });

      return req.then((session) => {
        if (session) {
          const sessionURL = SmartpayWithCheckoutSession.getSessionURL(
            session,
            {
              promotionCode: payload.promotionCode,
            }
          );

          if (sessionURL) {
            // eslint-disable-next-line no-param-reassign
            session.url = sessionURL;
          }
        }

        return session;
      });
    }

    listCheckoutSessions(params: ListParams = {}) {
      const req: Promise<Collection<CheckoutSession>> = this.request(
        `/checkout-sessions`,
        {
          method: GET,
          params,
        }
      );

      return req;
    }

    getCheckoutSession(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'CheckoutSession Id is required',
        });
      }

      if (!isValidCheckoutSessionId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'CheckoutSession Id is invalid',
        });
      }

      const req: Promise<CheckoutSession> = this.request(
        `/checkout-sessions/${id}`,
        {
          method: GET,
          params: omit(params, ['id']),
        }
      );

      return req;
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

  return SmartpayWithCheckoutSession;
};

export default checkoutSessionsMixin;
