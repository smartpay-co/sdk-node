import qs from 'query-string';

import {
  CheckoutSession,
  SimpleChekoutSessionPayload,
  ListParams,
  GetObjectParams,
  Collection,
} from '../types';
import {
  isValidCheckoutSessionId,
  validateCheckoutSessionPayload,
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

const checkoutSessionsMixin = <T extends Constructor>(Base: T) => {
  class SmartpayWithCheckoutSession extends Base {
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
        SmartpayWithCheckoutSession.normalizeCheckoutSessionPayload(payload);

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
