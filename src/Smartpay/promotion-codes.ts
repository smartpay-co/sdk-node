import {
  CreatePromotionCodeParams,
  UpdatePromotionCodeParams,
  ListParams,
  GetObjectParams,
  PromotionCode,
  Collection,
} from '../types';
import {
  isValidPromotionCodeId,
  isValidCouponId,
  omit,
  SmartpayError,
} from '../utils';

import { GET, POST, PATCH, Constructor } from './base';

export const COUPON_DISCOUNT_TYPE_AMOUNT = 'amount';
export const COUPON_DISCOUNT_TYPE_PERCENTAGE = 'percentage';

const promotionCodesMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    static COUPON_DISCOUNT_TYPE_AMOUNT = COUPON_DISCOUNT_TYPE_AMOUNT;
    static COUPON_DISCOUNT_TYPE_PERCENTAGE = COUPON_DISCOUNT_TYPE_PERCENTAGE;

    createPromotionCode(params: CreatePromotionCodeParams = {}) {
      const { code, coupon } = params;

      if (!code) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'name is required',
        });
      }

      if (!coupon) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Coupon Id is required',
        });
      }

      if (!isValidCouponId(coupon)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Coupon Id is invalid',
        });
      }

      const req: Promise<PromotionCode> = this.request(`/promotion-codes`, {
        method: POST,
        idempotencyKey: params.idempotencyKey,
        payload: omit(params, ['idempotencyKey']),
      });

      return req;
    }

    getPromotionCode(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Promotion Code Id is required',
        });
      }

      if (!isValidPromotionCodeId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Promotion Code Id is invalid',
        });
      }

      const req: Promise<PromotionCode> = this.request(
        `/promotion-codes/${id}`,
        {
          method: GET,
          params: omit(params, ['id']),
        }
      );

      return req;
    }

    updatePromotionCode(params: UpdatePromotionCodeParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Promotion Code Id is required',
        });
      }

      if (!isValidPromotionCodeId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Promotion Code Id is invalid',
        });
      }

      const req: Promise<PromotionCode> = this.request(
        `/promotion-codes/${id}`,
        {
          method: PATCH,
          payload: omit(params, ['id']),
        }
      );

      return req;
    }

    listPromotionCodes(params: ListParams = {}) {
      const req: Promise<Collection<PromotionCode>> = this.request(
        `/promotion-codes`,
        {
          method: GET,
          params,
        }
      );

      return req;
    }
  };
};

export default promotionCodesMixin;
