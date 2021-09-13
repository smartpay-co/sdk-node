import { validate, Schema } from 'jtd';

import { normalizeCheckoutSessionPayload as fromLooseCheckoutSessionPayload } from './payload.js';
import checkoutSessionPayloadSchema from './schemas/checkout-session-payload.jtd.js';
import type {
  KeyString,
  ChekoutSessionPayload,
  ChekoutSessionPayloadFlat,
} from './types';

const publicKeyRegExp = /^pk_(test|live)_[0-9a-zA-Z]+$/;
const secretKeyRegExp = /^sk_(test|live)_[0-9a-zA-Z]+$/;

const orderIdRegExp = /^order_(test|live)_[0-9a-zA-Z]+$/;
const paymentIdRegExp = /^payment_(test|live)_[0-9a-zA-Z]+$/;

export const isValidPublicApiKey = (apiKey: KeyString) => {
  return publicKeyRegExp.test(apiKey);
};

export const isValidSecretApiKey = (apiKey: KeyString) => {
  return secretKeyRegExp.test(apiKey);
};

export const isValidOrderId = (orderId: string) => {
  return orderIdRegExp.test(orderId);
};

export const isValidPaymentId = (paymentId: string) => {
  return paymentIdRegExp.test(paymentId);
};

export const isValidCheckoutSessionPayload = (
  payload: ChekoutSessionPayload
) => {
  return validate(
    checkoutSessionPayloadSchema as Schema,
    JSON.parse(JSON.stringify(payload))
  );
};

export const normalizeCheckoutSessionPayload = (
  input: ChekoutSessionPayloadFlat
) => {
  const payload = fromLooseCheckoutSessionPayload(input);
  const { orderData } = payload;

  // If not setting any currency in orderData
  // We take the currency in first line item
  if (!orderData.currency) {
    orderData.currency = orderData.lineItemData[0].priceData.currency;
  }

  const { currency } = orderData;

  if (!orderData.amount) {
    orderData.amount = orderData.lineItemData.reduce((sum, item) => {
      const { priceData } = item;

      if (priceData.currency === currency) {
        return sum + (priceData.amount || 0);
      }

      throw new Error('Amount of the order is required.');
    }, 0);
  }

  return payload;
};
