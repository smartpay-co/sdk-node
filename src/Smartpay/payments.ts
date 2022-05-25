import {
  Payment,
  CreatePaymentParams,
  GetPaymentParams,
  UpdatePaymentParams,
  ListParams,
  Collection,
} from '../types';
import {
  isValidOrderId,
  isValidPaymentId,
  omit,
  SmartpayError,
} from '../utils';

import { GET, POST, PATCH, Constructor } from './base';

const paymentsMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    createPayment(params: CreatePaymentParams = {}) {
      const { order, amount, currency } = params;

      if (!order) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Order Id is required',
        });
      }

      if (!isValidOrderId(order)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Order Id is invalid',
        });
      }

      if (!amount) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Capture Amount is required',
        });
      }

      if (!currency) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Capture Amount Currency is required',
        });
      }

      const req: Promise<Payment> = this.request(`/payments`, {
        method: POST,
        idempotencyKey: params.idempotencyKey,
        payload: omit(params, ['idempotencyKey']),
      });

      return req;
    }

    capture(params: CreatePaymentParams = {}) {
      return this.createPayment(params);
    }

    getPayment(params: GetPaymentParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payment Id is required',
        });
      }

      if (!isValidPaymentId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payment Id is invalid',
        });
      }

      const req: Promise<Payment> = this.request(`/payments/${id}`, {
        method: GET,
        params: omit(params, ['id']),
      });

      return req;
    }

    updatePayment(params: UpdatePaymentParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payment Id is required',
        });
      }

      if (!isValidPaymentId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payment Id is invalid',
        });
      }

      const req: Promise<Payment> = this.request(`/payments/${id}`, {
        method: PATCH,
        params: omit(params, ['id']),
      });

      return req;
    }

    listPayments(params: ListParams = {}) {
      const req: Promise<Collection<Payment>> = this.request(`/payments`, {
        method: GET,
        params,
      });

      return req;
    }
  };
};

export default paymentsMixin;
