export interface LooseObject {
  [key: string]: any;
}

export interface MetaData {
  [key: string]: string;
}

export type KeyString = string;

export type AddressType = 'gift' | 'home' | 'locker' | 'office' | 'store';

export type RefundReason = 'requested_by_customer' | 'fraudulent';

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

export type SimpleLineItem = {
  // LineItem
  quantity: number;
  // ProductData
  name: string;
  brand?: string;
  categories?: string[];
  gtin?: string;
  images?: string[];
  reference?: string;
  url?: string;
  // PriceData
  amount: number;
  currency: string;
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
  coupons?: string[];
  lineItemData: LineItemData[];
  shippingInfo?: ShippingInfo;
  reference?: string;
  description?: string;
  metadata?: MetaData;
};

export type ChekoutSessionPayload = {
  customerInfo: CustomerInfo;
  orderData: OrderData;
  successUrl: string;
  cancelUrl: string;
  reference?: string;
};

export type SimpleChekoutSessionPayload = {
  // OrderData
  amount?: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';

  items: SimpleLineItem[];
  shippingInfo?: ShippingInfo;
  customerInfo?: CustomerInfo;

  description?: string;
  metadata?: MetaData;
  reference?: string;

  successUrl?: string;
  cancelUrl?: string;

  promotionCode?: string;

  idempotencyKey?: string;
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
  successUrl: string;
  cancelUrl: string;
  reference?: string;
  metadata?: MetaData;
  url: string;
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
  payment: string;
  object: string;
  amount: number;
  currency: string;
  lineItems: LineItemData[];
  reason: RefundReason;
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

export type GetOrdersParams = {
  expand?: string;
  pageToken?: string;
  maxResults?: number;
};

export type GetOrderParams = {
  id?: string;
  expand?: string;
};

export type GetPaymentParams = {
  id?: string;
  expand?: string;
};

export type GetRefundParams = {
  id?: string;
  expand?: string;
};

export type CancelOrderParams = {
  id?: string;
  idempotencyKey?: string;
};

export type CreatePaymentParams = {
  order?: string;
  amount?: number;
  currency?: string;
  cancelRemainder?: 'automatic' | 'manual';
  reference?: string;
  description?: string;
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type CreateRefundParams = {
  payment?: string;
  amount?: number;
  currency?: string;
  reason?: RefundReason;
  reference?: string;
  description?: string;
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type OrdersCollection = {
  object: string;
  pageToken: string;
  nextPageToken?: string;
  maxResults: number;
  results: number;
  data: Array<Order>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorDetail = any;
export type ErrorDetails = ErrorDetail[];

export {};
