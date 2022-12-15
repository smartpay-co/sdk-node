import {
  Order,
  ListParams,
  GetObjectParams,
  CommonUpdateParams,
  Collection,
  OrderPayload,
} from '../types';
import {
  isValidOrderId,
  jtdErrorToDetails,
  omit,
  SmartpayError,
  validateTokenOrderPayload,
} from '../utils';

import { GET, PUT, Constructor, POST } from './base';

export const ORDER_STATUS_SUCCEEDED = 'succeeded';
export const ORDER_STATUS_CANCELED = 'canceled';
export const ORDER_STATUS_REJECTED = 'rejected';
export const ORDER_STATUS_FAILED = 'failed';
export const ORDER_STATUS_REQUIRES_AUTHORIZATION = 'requires_authorization';

const ordersMixin = <T extends Constructor>(Base: T) => {
  return class Orders extends Base {
    static ORDER_STATUS_SUCCEEDED = ORDER_STATUS_SUCCEEDED;
    static ORDER_STATUS_CANCELED = ORDER_STATUS_CANCELED;
    static ORDER_STATUS_REJECTED = ORDER_STATUS_REJECTED;
    static ORDER_STATUS_FAILED = ORDER_STATUS_FAILED;
    static ORDER_STATUS_REQUIRES_AUTHORIZATION =
      ORDER_STATUS_REQUIRES_AUTHORIZATION;

    static normalizeOrderPayload(payload: OrderPayload) {
      if (!payload) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payload is required',
        });
      }

      const errors = validateTokenOrderPayload(payload);

      if (errors.length) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payload invalid',
          details: jtdErrorToDetails(errors, 'payload'),
        });
      }

      return payload;
    }

    createOrder(payload: OrderPayload) {
      if (!payload) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Payload is required',
        });
      }
      const normalizedPayload = Orders.normalizeOrderPayload(payload);
      const req: Promise<Order> = this.request(`/orders`, {
        method: POST,
        idempotencyKey: payload.idempotencyKey,
        payload: omit(normalizedPayload, ['idempotencyKey']),
      });

      return req;
    }

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

    cancelOrder(params: CommonUpdateParams = {}) {
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
