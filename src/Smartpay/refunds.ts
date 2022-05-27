import {
  Refund,
  CreateRefundParams,
  GetObjectParams,
  UpdateRefundParams,
  ListParams,
  Collection,
} from '../types';
import {
  isValidPaymentId,
  isValidRefundId,
  omit,
  SmartpayError,
} from '../utils';

import { GET, POST, PATCH, Constructor } from './base';

const refundsMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    static REFUND_REQUEST_BY_CUSTOMER = 'requested_by_customer';
    static REFUND_FRAUDULENT = 'fraudulent';

    createRefund(params: CreateRefundParams = {}) {
      const { payment, amount, currency, reason } = params;

      if (!payment) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payment Id is required',
        });
      }

      if (!isValidPaymentId(payment)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payment Id is invalid',
        });
      }

      if (!amount) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Amount is required',
        });
      }

      if (!currency) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Amount Currency is required',
        });
      }

      if (!reason) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Reason is required',
        });
      }

      const req: Promise<Refund> = this.request(`/refunds`, {
        method: POST,
        idempotencyKey: params.idempotencyKey,
        payload: omit(params, ['idempotencyKey']),
      });

      return req;
    }

    refund(params: CreateRefundParams = {}) {
      return this.createRefund(params);
    }

    getRefund(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Id is required',
        });
      }

      if (!isValidRefundId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Id is invalid',
        });
      }

      const req: Promise<Refund> = this.request(`/refunds/${id}`, {
        method: GET,
        params: omit(params, ['id']),
      });

      return req;
    }

    /**
     * refundOrder will automatically find payments in the order and create refund
     * one by one until amount are all refunded.
     */
    // refundOrder() {}

    updateRefund(params: UpdateRefundParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Id is required',
        });
      }

      if (!isValidRefundId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Refund Id is invalid',
        });
      }

      const req: Promise<Refund> = this.request(`/refunds/${id}`, {
        method: PATCH,
        payload: omit(params, ['id']),
      });

      return req;
    }

    listRefunds(params: ListParams = {}) {
      const req: Promise<Collection<Refund>> = this.request(`/refunds`, {
        method: GET,
        params,
      });

      return req;
    }
  };
};

export default refundsMixin;
