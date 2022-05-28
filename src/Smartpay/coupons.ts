import {
  CreateCouponParams,
  UpdateCouponParams,
  ListParams,
  GetObjectParams,
  Coupon,
  Collection,
} from '../types';
import { isValidCouponId, omit, SmartpayError } from '../utils';

import { GET, POST, PATCH, Constructor } from './base';

export const COUPON_DISCOUNT_TYPE_AMOUNT = 'amount';
export const COUPON_DISCOUNT_TYPE_PERCENTAGE = 'percentage';

const couponsMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    static COUPON_DISCOUNT_TYPE_AMOUNT = COUPON_DISCOUNT_TYPE_AMOUNT;
    static COUPON_DISCOUNT_TYPE_PERCENTAGE = COUPON_DISCOUNT_TYPE_PERCENTAGE;

    createCoupon(params: CreateCouponParams = {}) {
      const {
        name,
        discountType,
        discountAmount,
        currency,
        discountPercentage,
      } = params;

      if (!name) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'name is required',
        });
      }

      if (!discountType) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'discountType is required',
        });
      }

      if (
        ![
          COUPON_DISCOUNT_TYPE_AMOUNT,
          COUPON_DISCOUNT_TYPE_PERCENTAGE,
        ].includes(discountType)
      ) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'discountType is invalid',
        });
      }

      if (
        discountType === COUPON_DISCOUNT_TYPE_AMOUNT &&
        discountAmount == null
      ) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'discountAmount is invalid',
        });
      }

      if (discountType === COUPON_DISCOUNT_TYPE_AMOUNT && !currency) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'currency is required',
        });
      }
      if (
        discountType === COUPON_DISCOUNT_TYPE_PERCENTAGE &&
        discountPercentage == null
      ) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'discountPercentage is invalid',
        });
      }

      const req: Promise<Coupon> = this.request(`/coupons`, {
        method: POST,
        idempotencyKey: params.idempotencyKey,
        payload: omit(params, ['idempotencyKey']),
      });

      return req;
    }

    getCoupon(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Coupon Id is required',
        });
      }

      if (!isValidCouponId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Coupon Id is invalid',
        });
      }

      const req: Promise<Coupon> = this.request(`/coupons/${id}`, {
        method: GET,
        params: omit(params, ['id']),
      });

      return req;
    }

    updateCoupon(params: UpdateCouponParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Coupon Id is required',
        });
      }

      if (!isValidCouponId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Coupon Id is invalid',
        });
      }

      const req: Promise<Coupon> = this.request(`/coupons/${id}`, {
        method: PATCH,
        payload: omit(params, ['id']),
      });

      return req;
    }

    listCoupons(params: ListParams = {}) {
      const req: Promise<Collection<Coupon>> = this.request(`/coupons`, {
        method: GET,
        params,
      });

      return req;
    }
  };
};

export default couponsMixin;
