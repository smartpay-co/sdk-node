/* eslint @typescript-eslint/no-shadow: 0 */

import type {
  CustomerInfo,
  CustomerInfoLoose,
  SimpleLineItem,
  SimpleChekoutSessionPayload,
  ShippingInfo,
  Address,
} from './types';
import { omit } from './utils';

export const normalizeCustomerInfo = (
  customer: CustomerInfoLoose = {}
): CustomerInfo => {
  const {
    accountAge,
    emailAddress,
    firstName,
    lastName,
    firstNameKana,
    lastNameKana,
    address,
    phoneNumber,
    dateOfBirth,
    legalGender,
    reference,
  } = customer;

  const rest = omit(customer, [
    'accountAge',
    'emailAddress',
    'firstName',
    'lastName',
    'firstNameKana',
    'lastNameKana',
    'address',
    'phoneNumber',
    'dateOfBirth',
    'legalGender',
    'reference',
  ]);

  return {
    ...rest,
    accountAge,
    emailAddress,
    firstName,
    lastName,
    firstNameKana,
    lastNameKana,
    address,
    phoneNumber,
    dateOfBirth,
    legalGender,
    reference,
  };
};

export const normalizeItem = (item: SimpleLineItem) => {
  const {
    quantity,
    name,
    brand,
    categories,
    gtin,
    images,
    reference,
    url,
    amount,
    currency,
    label,
    description,
    metadata,
    productDescription,
    productMetadata,
    priceDescription,
    priceMetadata,
  } = item;

  const rest = omit(item, [
    'quantity',
    'name',
    'brand',
    'categories',
    'gtin',
    'images',
    'reference',
    'url',
    'amount',
    'currency',
    'label',
    'description',
    'metadata',
    'productDescription',
    'productMetadata',
    'priceDescription',
    'priceMetadata',
  ]);

  return {
    ...rest,
    quantity,
    name,
    brand,
    categories,
    gtin,
    images,
    reference,
    url,
    amount,
    currency,
    label,
    description,
    metadata,
    productDescription,
    productMetadata,
    priceDescription,
    priceMetadata,
  };
};

export const normalizeItems = (list: SimpleLineItem[] = []) =>
  Array.isArray(list) ? list.map((item) => normalizeItem(item)) : [];

export const normalizeAddress = (address: Partial<Address> = {}) => {
  const {
    line1,
    line2,
    line3,
    line4,
    line5,
    subLocality,
    locality,
    administrativeArea,
    postalCode,
    country,
  } = address;

  const rest = omit(address, [
    'line1',
    'line2',
    'line3',
    'line4',
    'line5',
    'subLocality',
    'locality',
    'administrativeArea',
    'postalCode',
    'country',
  ]);

  return {
    ...rest,
    line1,
    line2,
    line3,
    line4,
    line5,
    subLocality,
    locality,
    administrativeArea,
    postalCode,
    country,
  };
};

export const normalizeShippingInfo = (shipping: Partial<ShippingInfo> = {}) => {
  const { address, addressType, feeAmount, feeCurrency } = shipping;

  const rest = omit(shipping, [
    'address',
    'addressType',
    'feeAmount',
    'feeCurrency',
  ]);

  return {
    ...rest,
    address: normalizeAddress(address),
    addressType,
    feeAmount,
    feeCurrency,
  };
};

export const normalizeCheckoutSessionPayload = (
  payload: SimpleChekoutSessionPayload
) => {
  const {
    amount,
    currency,
    captureMethod,
    items,
    customerInfo,
    shippingInfo,
    reference,
    description,
    metadata,
    successUrl,
    cancelUrl,
  } = payload;

  const rest = omit(payload, [
    'amount',
    'currency',
    'captureMethod',
    'items',
    'customerInfo',
    'shippingInfo',
    'reference',
    'metadata',
    'description',
    'successUrl',
    'cancelUrl',
  ]);

  return {
    ...rest,
    amount,
    currency,
    captureMethod,
    items: normalizeItems(items),
    customerInfo: normalizeCustomerInfo(customerInfo),
    shippingInfo: normalizeShippingInfo(shippingInfo),
    reference,
    description,
    metadata,
    successUrl,
    cancelUrl,
  };
};

export default {
  normalizeCheckoutSessionPayload,
};
