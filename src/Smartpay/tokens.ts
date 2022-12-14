import {
  Token,
  ListParams,
  GetObjectParams,
  CommonUpdateParams,
  Collection,
} from '../types';
import { isValidTokenId, omit, SmartpayError } from '../utils';

import { GET, PUT, Constructor, DELETE } from './base';

export const TOKEN_STATUS_ACTIVE = 'active';
export const TOKEN_STATUS_DISABLED = 'disabled';
export const TOKEN_STATUS_REJECTED = 'rejected';
export const TOKEN_STATUS_REQUIRES_AUTHORIZATION = 'requires_authorization';

const tokensMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    static TOKEN_STATUS_ACTIVE = TOKEN_STATUS_ACTIVE;
    static TOKEN_STATUS_DISABLED = TOKEN_STATUS_DISABLED;
    static TOKEN_STATUS_REJECTED = TOKEN_STATUS_REJECTED;
    static TOKEN_STATUS_REQUIRES_AUTHORIZATION =
      TOKEN_STATUS_REQUIRES_AUTHORIZATION;

    getToken(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is required',
        });
      }

      if (!isValidTokenId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is invalid',
        });
      }

      const req: Promise<Token> = this.request(`/tokens/${id}`, {
        method: GET,
        params: omit(params, ['id']),
      });

      return req;
    }

    enableToken(params: CommonUpdateParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is required',
        });
      }

      if (!isValidTokenId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is invalid',
        });
      }

      const req: Promise<Token> = this.request(`/tokens/${id}/enable`, {
        method: PUT,
        idempotencyKey: params.idempotencyKey,
      });

      return req;
    }

    disableToken(params: CommonUpdateParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is required',
        });
      }

      if (!isValidTokenId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is invalid',
        });
      }

      const req: Promise<Token> = this.request(`/tokens/${id}/disable`, {
        method: PUT,
        idempotencyKey: params.idempotencyKey,
      });

      return req;
    }

    deleteToken(params: CommonUpdateParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is required',
        });
      }

      if (!isValidTokenId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Token Id is invalid',
        });
      }

      const req: Promise<Token> = this.request(`/tokens/${id}`, {
        method: DELETE,
        params: omit(params, ['id']),
        idempotencyKey: params.idempotencyKey,
      });

      return req;
    }

    listTokens(params: ListParams = {}) {
      const req: Promise<Collection<Token>> = this.request(`/tokens`, {
        method: GET,
        params,
      });

      return req;
    }
  };
};

export default tokensMixin;
