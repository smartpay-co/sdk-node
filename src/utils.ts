import { validate } from "jtd";

import payloadSchema from "./schemas/payload-schema";

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
  return validate(payloadSchema, payload);
};
