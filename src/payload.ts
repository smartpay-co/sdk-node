/* eslint @typescript-eslint/no-shadow: 0 */

import type {
  CustomerInfo,
  CustomerInfoLoose,
  SimpleLineItem,
  SimpleChekoutSessionPayload,
  ShippingInfo,
  Address,
  LooseObject,
} from './types';

export const omit = (obj: LooseObject, omitKeys: string[]) => {
  const rest = { ...obj };

  for (let i = 0; i < omitKeys.length; i += 1) {
    const key = omitKeys[i];

    delete rest[key];
  }

  return rest;
};

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

export const normalizeShippingInfo = (
  shipping: Partial<ShippingInfo> & Partial<Address> = {}
) => {
  const {
    address,
    addressType,
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
    feeAmount,
    feeCurrency,
  } = shipping;

  const rest = omit(shipping, [
    'address',
    'addressType',
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
    'feeAmount',
    'feeCurrency',
  ]);

  return {
    ...rest,
    address: address || {
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
    },
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
    confirmationMethod,
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
    'confirmationMethod',
    'coupons',
    'shippingInfo',
    'items',
    'shipping',
    'customerInfo',
    'customer',
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
    confirmationMethod,
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
