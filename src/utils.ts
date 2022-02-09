import { validate, Schema } from 'jtd';

import { normalizeCheckoutSessionPayload as fromSimpleCheckoutSessionPayload } from './payload';
import checkoutSessionPayloadSchema from './schemas/simple-checkout-session-payload.jtd';
import type {
  KeyString,
  SimpleChekoutSessionPayload,
  ErrorDetails,
} from './types';

const publicKeyRegExp = /^pk_(test|live)_[0-9a-zA-Z]+$/;
const secretKeyRegExp = /^sk_(test|live)_[0-9a-zA-Z]+$/;

const checkoutSessionIDRegExp = /^checkout_(test|live)_[0-9a-zA-Z]+$/;
const orderIDRegExp = /^order_(test|live)_[0-9a-zA-Z]+$/;
const paymentIDRegExp = /^payment_(test|live)_[0-9a-zA-Z]+$/;

export class SmartError extends Error {
  statusCode?: number;
  errorCode: string;
  details?: ErrorDetails;

  constructor({
    message,
    statusCode,
    errorCode,
    details,
  }: {
    message?: string;
    statusCode?: number;
    errorCode: string;
    details?: ErrorDetails;
  }) {
    super(message);
    this.message = message || errorCode;
    this.name = 'SmartError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export const isValidPublicApiKey = (apiKey: KeyString) => {
  return publicKeyRegExp.test(apiKey);
};

export const isValidSecretApiKey = (apiKey: KeyString) => {
  return secretKeyRegExp.test(apiKey);
};

export const isValidCheckoutSessionID = (checkoutSessionID: string) => {
  return checkoutSessionIDRegExp.test(checkoutSessionID);
};

export const isValidOrderID = (orderID: string) => {
  return orderIDRegExp.test(orderID);
};

export const isValidPaymentID = (paymentID: string) => {
  return paymentIDRegExp.test(paymentID);
};

export const validateCheckoutSessionPayload = (
  payload: SimpleChekoutSessionPayload
) => {
  const errors = validate(
    checkoutSessionPayloadSchema as Schema,
    JSON.parse(JSON.stringify(payload))
    // payload
  ) as ErrorDetails;

  if (payload.items.length === 0) {
    errors.push('payload.items is required.');
  }

  return errors;
};

/**
 * Try to get the currency of this checkout
 */
export const getCurrency = (payload: SimpleChekoutSessionPayload) => {
  let { currency } = payload;

  if (!currency) {
    currency = payload.items[0]?.currency;
  }

  return currency;
};

export const normalizeCheckoutSessionPayload = (
  input: SimpleChekoutSessionPayload
) => {
  const payload = fromSimpleCheckoutSessionPayload(input);
  const { shippingInfo } = payload;
  const currency = getCurrency(payload);

  if (!currency) {
    throw new SmartError({
      errorCode: 'request.invalid',
      details: ['Currency is not available.'],
    });
  }

  if (!payload.currency) {
    payload.currency = currency;
  }

  if (shippingInfo && !shippingInfo?.feeCurrency) {
    shippingInfo.feeCurrency = currency;
  }

  const feeCurrency = shippingInfo?.feeCurrency;
  const feeAmount = shippingInfo?.feeAmount;
  const shipping = (feeCurrency === currency && feeAmount) || 0;

  if (payload.amount == null) {
    payload.amount =
      payload.items.reduce((sum, item) => {
        let itemCurrency = item.currency;

        if (!itemCurrency) {
          // eslint-disable-next-line no-param-reassign
          item.currency = currency;
          itemCurrency = currency;
        }

        if (itemCurrency === currency) {
          return sum + (item.amount ? item.amount * item.quantity : 0);
        }

        throw new SmartError({
          errorCode: 'request.invalid',
          details: ['payload.items[].currency is invalid'],
        });
      }, 0) + shipping;
  }

  return payload;
};

export const DEFAULT_ERROR_MESSAGES: {
  [key: string]: string;
} = {
  'request.invalid': 'Input parameter or payload is invalid',
  'request.malformed': 'Input payload in malformed, could not be decoded',
  unexpected_error: 'Unexpected error occured',
};

export const jtdErrorToDetails = (errors: ErrorDetails, prefix?: string) =>
  errors.map((error) =>
    error.instancePath && error.schemaPath
      ? `${prefix}.${error.instancePath.join('.')} is invalid (${
          error.schemaPath
        })`
      : error
  );
