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
} from './types';

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

  return {
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

export const normalizeProductData = ({
  name,
  brand,
  categories,
  description,
  gtin,
  images,
  reference,
  url,
  metadata,
}: Partial<ProductData> = {}) => ({
  name,
  brand,
  categories,
  description,
  gtin,
  images,
  reference,
  url,
  metadata,
});

export const normalizePriceData = ({
  productData,
  amount,
  currency,
  metadata,
}: Partial<PriceData> = {}) => ({
  productData: normalizeProductData(productData),
  amount,
  currency,
  metadata,
});

export const normalizeLineItemData = ({
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
}: LineItemDataFlat) => ({
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
        amount != null ? amount : typeof price === 'number' ? price : undefined,
      currency,
      label,
      description: priceDescription,
      metadata: priceMetadata,
    }
  ),
  quantity,
  description,
  metadata,
});

export const normalizeLineItemDataList = (list: LineItemDataFlat[] = []) =>
  Array.isArray(list) ? list.map((item) => normalizeLineItemData(item)) : [];

export const normalizeOrderData = ({
  amount,
  currency,
  captureMethod,
  confirmationMethod,
  coupons,
  shippingInfo,
  items,
  lineItemData,
}: OrderDataLoose) => ({
  amount,
  currency,
  captureMethod,
  confirmationMethod,
  coupons,
  shippingInfo,
  lineItemData: normalizeLineItemDataList(lineItemData || items),
});

export const normalizeShipping = ({
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
}: Partial<ShippingInfo> & Partial<Address> = {}) => ({
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
});

export const normalizeCheckoutSessionPayload = ({
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
  successURL,
  cancelURL,
  metadata,
  orderDescription,
  orderMetadata,
  test,
}: ChekoutSessionPayloadFlat) => ({
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
      description: orderDescription,
      metadata: orderMetadata,
    }
  ),
  reference,
  metadata,
  successUrl: successURL, // Temp prop
  cancelUrl: cancelURL, // Temp prop
  test,
});

export default {
  normalizeCheckoutSessionPayload,
};
