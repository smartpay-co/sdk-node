import { validate, Schema } from 'jtd';

import { normalizeCheckoutSessionPayload as fromLooseCheckoutSessionPayload } from './payload';
import checkoutSessionPayloadSchema from './schemas/checkout-session-payload.jtd';
import type {
  KeyString,
  ChekoutSessionPayload,
  ChekoutSessionPayloadFlat,
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

export const isValidCheckoutSessionPayload = (
  payload: ChekoutSessionPayload
) => {
  const errors = validate(
    checkoutSessionPayloadSchema as Schema,
    JSON.parse(JSON.stringify(payload))
    // payload
  ) as ErrorDetails;

  if (payload.orderData.lineItemData.length === 0) {
    errors.push('payload.orderData.lineItemnData is required.');
  }

  return errors;
};

export const normalizeCheckoutSessionPayload = (
  input: ChekoutSessionPayloadFlat
) => {
  const payload = fromLooseCheckoutSessionPayload(input);
  const { orderData } = payload;

  // If not setting any currency in orderData
  // We take the currency in first line item
  if (!orderData.currency) {
    orderData.currency = orderData.lineItemData[0]?.priceData?.currency;
  }

  const { currency } = orderData;

  if (orderData.amount == null) {
    orderData.amount = orderData.lineItemData.reduce((sum, item) => {
      const { priceData } = item;

      if (priceData.currency === currency) {
        return sum + (priceData.amount || 0);
      }

      throw new SmartError({
        errorCode: 'request.invalid',
        details: ['payload.orderData.lineItemData[].currency is invalid'],
      });
    }, 0);
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
      ? `${prefix}.${error.instancePath.join('.')} is invalid`
      : error
  );
