/* eslint @typescript-eslint/no-shadow: 0 */

import type {
  CustomerInfo,
  CustomerInfoLoose,
  ProductData,
  PriceData,
  LineItemDataFlat,
  OrderDataLoose,
  ChekoutSessionPayloadFlat,
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
    email,
    firstName,
    lastName,
    firstNameKana,
    lastNameKana,
    address,
    phoneNumber,
    phone,
    dateOfBirth,
    legalGender,
    gender,
    reference,
  } = customer;

  const rest = omit(customer, [
    'accountAge',
    'emailAddress',
    'email',
    'firstName',
    'lastName',
    'firstNameKana',
    'lastNameKana',
    'address',
    'phoneNumber',
    'phone',
    'dateOfBirth',
    'legalGender',
    'gender',
    'reference',
  ]);

  return {
    ...rest,
    accountAge,
    emailAddress: emailAddress || email,
    firstName,
    lastName,
    firstNameKana,
    lastNameKana,
    address,
    phoneNumber: phoneNumber || phone,
    dateOfBirth,
    legalGender: legalGender || gender,
    reference,
  };
};

export const normalizeProductData = (product: Partial<ProductData> = {}) => {
  const {
    name,
    brand,
    categories,
    description,
    gtin,
    images,
    reference,
    url,
    metadata,
  } = product;

  const rest = omit(product, [
    'name',
    'brand',
    'categories',
    'description',
    'gtin',
    'images',
    'reference',
    'url',
    'metadata',
  ]);

  return {
    ...rest,
    name,
    brand,
    categories,
    description,
    gtin,
    images,
    reference,
    url,
    metadata,
  };
};

export const normalizePriceData = (price: Partial<PriceData> = {}) => {
  const { productData, amount, currency, metadata } = price;

  const rest = omit(price, ['productData', 'amount', 'currency', 'metadata']);

  return {
    ...rest,
    productData: normalizeProductData(productData),
    amount,
    currency,
    metadata,
  };
};

export const normalizeLineItemData = (item: LineItemDataFlat) => {
  const {
    price,
    priceData,
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
    'price',
    'priceData',
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
    price: typeof price === 'string' ? price : undefined,
    priceData: normalizePriceData(
      priceData || {
        productData: {
          name,
          brand,
          categories,
          gtin,
          images,
          reference,
          url,
          description: productDescription,
          metadata: productMetadata,
        },
        amount:
          // eslint-disable-next-line no-nested-ternary
          amount != null
            ? amount
            : typeof price === 'number'
            ? price
            : undefined,
        currency,
        label,
        description: priceDescription,
        metadata: priceMetadata,
      }
    ),
    quantity,
    description,
    metadata,
  };
};

export const normalizeLineItemDataList = (list: LineItemDataFlat[] = []) =>
  Array.isArray(list) ? list.map((item) => normalizeLineItemData(item)) : [];

export const normalizeOrderData = (order: OrderDataLoose) => {
  const {
    amount,
    currency,
    captureMethod,
    confirmationMethod,
    coupons,
    shippingInfo,
    items,
    lineItemData,
    reference,
    description,
    metadata,
  } = order;

  const rest = omit(order, [
    'amount',
    'currency',
    'captureMethod',
    'confirmationMethod',
    'coupons',
    'shippingInfo',
    'items',
    'lineItemData',
    'reference',
    'description',
    'metadata',
  ]);

  return {
    ...rest,
    amount,
    currency,
    captureMethod,
    confirmationMethod,
    coupons,
    shippingInfo,
    lineItemData: normalizeLineItemDataList(lineItemData || items),
    reference,
    description,
    metadata,
  };
};

export const normalizeShipping = (
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
  payload: ChekoutSessionPayloadFlat
) => {
  const {
    amount,
    currency,
    captureMethod,
    confirmationMethod,
    coupons,
    lineItemData,
    shippingInfo,
    items,
    shipping,
    customerInfo,
    customer,
    orderData,
    reference,
    description,
    metadata,
    successUrl,
    cancelUrl,
    successURL,
    cancelURL,
  } = payload;

  const rest = omit(payload, [
    'amount',
    'currency',
    'captureMethod',
    'confirmationMethod',
    'coupons',
    'lineItemData',
    'shippingInfo',
    'items',
    'shipping',
    'customerInfo',
    'customer',
    'orderData',
    'reference',
    'metadata',
    'description',
    'promotionCode',
    'successUrl',
    'cancelUrl',
  ]);

  return {
    ...rest,
    customerInfo: normalizeCustomerInfo(customerInfo || customer),
    orderData: normalizeOrderData(
      orderData || {
        amount,
        currency,
        captureMethod,
        confirmationMethod,
        coupons,
        shippingInfo: shippingInfo || normalizeShipping(shipping),
        items,
        lineItemData,
        reference,
        description,
        metadata,
      }
    ),
    successUrl: successUrl || successURL || '',
    cancelUrl: cancelUrl || cancelURL || '',
  };
};

export default {
  normalizeCheckoutSessionPayload,
};
