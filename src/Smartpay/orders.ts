import {
  Order,
  ListParams,
  GetOrderParams,
  CancelOrderParams,
  Collection,
} from '../types';
import { isValidOrderId, omit, SmartpayError } from '../utils';

import { GET, PUT, Constructor } from './base';

const ordersMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    getOrders(params: ListParams = {}) {
      const req: Promise<Collection<Order>> = this.request(`/orders`, {
        method: GET,
        params,
      });

      return req;
    }

    getOrder(params: GetOrderParams = {}) {
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
  };
};

export default ordersMixin;
