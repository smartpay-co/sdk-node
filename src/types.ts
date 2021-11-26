export interface MetaData {
  [key: string]: string;
}

export type KeyString = string;

export type AddressType = 'gift' | 'home' | 'locker' | 'office' | 'store';

export type SmartPayOptions = {
  publicKey?: KeyString;
  apiPrefix?: string;
  checkoutURL?: string;
};

export type Address = {
  line1?: string; // required, leave the validation to server side
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  subLocality?: string;
  locality?: string; // required, leave the validation to server side
  administrativeArea?: string;
  postalCode?: string; // required, leave the validation to server side
  country?: string; // required, leave the validation to server side
};

export type CustomerInfo = {
  accountAge?: number;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  firstNameKana?: string;
  lastNameKana?: string;
  address?: Address;
  phoneNumber?: string;
  dateOfBirth?: string;
  legalGender?: string;
  reference?: string;
};

export type CustomerInfoLoose = {
  accountAge?: number;
  emailAddress?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  firstNameKana?: string;
  lastNameKana?: string;
  address?: Address;
  phoneNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  legalGender?: string;
  gender?: string;
  reference?: string;
};

export type ProductData = {
  name?: string; // required, leave the validation to server side
  brand?: string;
  categories?: string[];
  description?: string;
  gtin?: string;
  images?: string[];
  reference?: string;
  url?: string;
  metadata?: MetaData;
};

export type PriceData = {
  productData: ProductData;
  amount?: number; // required, leave the validation to server side
  currency?: string; // required, leave the validation to server side
  label?: string;
  description?: string;
  metadata?: MetaData;
};

export type LineItemData = {
  price?: string;
  priceData?: PriceData;
  quantity: number;
  label?: string;
  description?: string;
  metadata?: MetaData;
};

export type LineItemDataFlat = {
  // LineItem
  price?: string;
  priceData?: PriceData;
  quantity: number;
  // ProductData
  name?: string;
  brand?: string;
  categories?: string[];
  gtin?: string;
  images?: string[];
  reference?: string;
  url?: string;
  // PriceData
  amount?: number;
  priceAmount?: number;
  currency?: string;
  label?: string;

  description?: string;
  metadata?: MetaData;
  productDescription?: string;
  productMetadata?: MetaData;
  priceDescription?: string;
  priceMetadata?: MetaData;
};

export type ShippingInfo = {
  address: Address;
  addressType?: AddressType;
  carrierName?: string;
  reference?: string;
  feeAmount?: number;
  feeCurrency?: string;
};

export type OrderData = {
  amount?: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';
  confirmationMethod?: 'automatic' | 'manual';
  coupons?: string[];
  description?: string;
  lineItemData: LineItemData[];
  shippingInfo?: ShippingInfo;
  metadata?: MetaData;
};

export type OrderDataLoose = {
  amount?: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';
  confirmationMethod?: 'automatic' | 'manual';
  coupons?: string[];
  description?: string;
  lineItemData?: LineItemData[];
  items?: LineItemDataFlat[];
  shippingInfo?: ShippingInfo;
  metadata?: MetaData;
};

export type ChekoutSessionPayload = {
  customerInfo: CustomerInfo;
  orderData: OrderData;
  successUrl: string;
  cancelUrl: string;
  reference?: string;
};

export type ChekoutSessionPayloadFlat = {
  // OrderData
  amount?: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';
  confirmationMethod?: 'automatic' | 'manual';
  coupons?: string[];
  lineItemData?: LineItemData[];
  shippingInfo?: ShippingInfo;

  // Shortuts of OrderData
  items?: LineItemDataFlat[];
  shipping?: Partial<ShippingInfo> & Partial<Address>;

  // CustomerInfo
  customerInfo?: CustomerInfo;
  customer?: CustomerInfoLoose;

  // Rest of CheckoutSession
  orderData?: OrderData;
  reference?: string;
  successURL: string;
  cancelURL: string;

  description?: string;
  metadata?: MetaData;
  orderDescription?: string;
  orderMetadata?: MetaData;

  test?: boolean;
};

export type RefundPayload = {
  payment: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: MetaData;
};

// Response Types

export type Product = {
  name: string;
  brand?: string;
  categories?: string[];
  description?: string;
  gtin?: string;
  images?: string[];
  reference?: string;
  url?: string;
  metadata?: MetaData;
};

export type Price = {
  product: Product;
  amount: number;
  currency: string;
  label?: string;
  description?: string;
  metadata?: MetaData;
};

export type LineItem = {
  price: Price;
  quantity: number;
  label?: string;
  description?: string;
  metadata?: MetaData;
};

export type Order = {
  id: string;
  status: string;
  object: string;
  test: boolean;
  createdAt: number;
  expiresAt: number;
  updatedAt: number;
  amount: number;
  currency: string;
  description?: string;
  lineItems: LineItem[];
  shippingInfo: ShippingInfo;
  metadata?: MetaData;
};

export type CheckoutSession = {
  id: string;
  object: string;
  test: boolean;
  createdAt: number;
  expiresAt: number;
  updatedAt: number;
  customerInfo: CustomerInfo;
  order: Order;
  successURL: string;
  cancelURL: string;
  reference?: string;
  metadata?: MetaData;
  checkoutURL?: string;
};

export type Payment = {
  id: string;
  status: string;
  object: string;
  test: boolean;
  createdAt: number;
  updatedAt: number;
  amount: number;
  currency: string;
  description?: string;
  lineItems: string[];
  order: string;
  refunds: string[];
  metadata?: MetaData;
};

export type Refund = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  test: boolean;
  createdAt: number;
  updatedAt: number;
  description?: string;
  metadata?: MetaData;
};

export type JTDError = {
  instancePath: string[];
  schemaPath: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorDetail = any;
export type ErrorDetails = ErrorDetail[];

export {};
