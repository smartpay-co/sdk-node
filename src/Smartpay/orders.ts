import {
  Order,
  ListParams,
  GetObjectParams,
  CancelOrderParams,
  Collection,
} from '../types';
import { isValidOrderId, omit, SmartpayError } from '../utils';

import { GET, PUT, Constructor } from './base';

export const ORDER_STATUS_SUCCEEDED = 'succeeded';
export const ORDER_STATUS_CANCELED = 'canceled';
export const ORDER_STATUS_REJECTED = 'rejected';
export const ORDER_STATUS_FAILED = 'failed';
export const ORDER_STATUS_REQUIRES_AUTHORIZATION = 'requires_authorization';

const ordersMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    static ORDER_STATUS_SUCCEEDED = ORDER_STATUS_SUCCEEDED;
    static ORDER_STATUS_CANCELED = ORDER_STATUS_CANCELED;
    static ORDER_STATUS_REJECTED = ORDER_STATUS_REJECTED;
    static ORDER_STATUS_FAILED = ORDER_STATUS_FAILED;
    static ORDER_STATUS_REQUIRES_AUTHORIZATION =
      ORDER_STATUS_REQUIRES_AUTHORIZATION;

    getOrder(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Order Id is required',
        });
      }

      if (!isValidOrderId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Order Id is invalid',
        });
      }

      const req: Promise<Order> = this.request(`/orders/${id}`, {
        method: GET,
        params: omit(params, ['id']),
      });

      return req;
    }

    cancelOrder(params: CancelOrderParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Order Id is required',
        });
      }

      if (!isValidOrderId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Order Id is invalid',
        });
      }

      const req: Promise<Order> = this.request(`/orders/${id}/cancellation`, {
        method: PUT,
        params: omit(params, ['id']),
        idempotencyKey: params.idempotencyKey,
      });

      return req;
    }

    listOrders(params: ListParams = {}) {
      const req: Promise<Collection<Order>> = this.request(`/orders`, {
        method: GET,
        params,
      });

      return req;
    }
  };
};

export default ordersMixin;
