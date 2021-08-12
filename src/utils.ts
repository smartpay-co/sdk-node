import { validate } from 'jtd';

import checkoutPayloadSchema from './schemas/checkout-payload.js';
import type { KeyString, ChekoutSessionPayload } from './types';

const publicKeyRegExp = /^pk_(test|live)_[0-9a-zA-Z]+$/;
const secretKeyRegExp = /^sk_(test|live)_[0-9a-zA-Z]+$/;

const orderIdRegExp = /^order_[0-9a-zA-Z]+$/;

export const isValidPublicApiKey = (apiKey: KeyString) => {
  return publicKeyRegExp.test(apiKey);
};

export const isValidSecretApiKey = (apiKey: KeyString) => {
  return secretKeyRegExp.test(apiKey);
};

export const isValidOrderId = (orderId: string) => {
  return orderIdRegExp.test(orderId);
};

export const isValidCheckoutPayload = (payload: ChekoutSessionPayload) => {
  return validate(checkoutPayloadSchema, payload);
};

export const normalizeCheckoutPayload = (input: ChekoutSessionPayload) => {
  const payload = { ...input };

  if (!payload.currency) {
    payload.currency = input.lineItems[0].currency;
  }

  if (!payload.amount) {
    payload.amount = input.lineItems.reduce((sum, item) => {
      if (item.currency !== payload.currency) {
        throw new Error('Currency of all items should be the same.');
      }

      return sum + item.price;
    }, 0);
  }

  return payload;
};
