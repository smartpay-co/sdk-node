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
  kind?: string;
  price?: string;
  priceData?: PriceData;
  quantity: number;
  label?: string;
  description?: string;
  metadata?: MetaData;
};

export type ExpandableLineItemData = LineItemData | string;

export type SimpleLineItem = {
  kind?: string;
  // LineItem
  quantity?: number;
  // ProductData
  name?: string;
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
  lineItemData: ExpandableLineItemData[];
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

export type FlatChekoutSessionPayload = {
  mode?: 'token';
  // OrderData
  amount?: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';

  items: SimpleLineItem[];
  shippingInfo: ShippingInfo;
  customerInfo: CustomerInfo;
  locale?: string;

  successUrl?: string;
  cancelUrl?: string;

  description?: string;
  metadata?: MetaData;
  reference?: string;

  promotionCode?: string;

  idempotencyKey?: string;
};

export type TokenChekoutSessionPayload = {
  mode: 'token';
  customerInfo?: CustomerInfo;
  locale?: string;

  successUrl?: string;
  cancelUrl?: string;

  metadata?: MetaData;
  reference?: string;

  idempotencyKey?: string;
};

export type OrderPayload = {
  token?: string;
  // OrderData
  amount: number;
  currency: string;
  captureMethod?: 'automatic' | 'manual';

  items: SimpleLineItem[];
  shippingInfo: ShippingInfo;
  customerInfo: CustomerInfo;

  metadata?: MetaData;
  reference?: string;

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
  order?: string | Order;
  token?: string | Token;
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
  lineItems: ExpandableLineItemData[];
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
  lineItems: ExpandableLineItemData[];
  reason: RefundReason;
  test: boolean;
  createdAt: number;
  updatedAt: number;
  description?: string;
  metadata?: MetaData;
};

export type WebhookEndpoint = {
  id: string;
  object: string;
  active: boolean;
  createdAt: number;
  description?: string;
  eventSubscriptions: string[];
  metadata?: MetaData;
  test: boolean;
  url: string;
  updatedAt: number;
};

export type Coupon = {
  id: string;
  object: string;
  active: boolean;
  name: string;
  createdAt: number;
  currency?: string;
  description?: string;
  discountAmount?: number;
  discountPercentage?: number;
  discountType: string;
  expiresAt?: number;
  maxRedemptionCount?: number;
  redemptionCount: number;
  sponsored: boolean;
  metadata?: MetaData;
  test: boolean;
  updatedAt: number;
};

export type PromotionCode = {
  id: string;
  object: string;
  active: boolean;
  code: string;
  createdAt: number;
  currency?: string;
  expiresAt?: number;
  firstTimeTransaction: boolean;
  onePerCustomer: boolean;
  maxRedemptionCount?: number;
  redemptionCount: number;
  minimumAmount?: number;
  metadata?: MetaData;
  test: boolean;
  updatedAt: number;
};

export type Token = {
  id: string;
  object: string;
  createdAt: number;
  status: string;
  reference?: string;
  test: boolean;
  updatedAt: number;
};

export type JTDError = {
  instancePath: string[];
  schemaPath: string[];
};

export type ListParams = {
  expand?: string;
  pageToken?: string;
  maxResults?: number;
};

export type GetObjectParams = {
  id?: string;
  expand?: string;
};

export type CommonUpdateParams = {
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
  lineItems?: string[];
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type UpdatePaymentParams = {
  id?: string;
  reference?: string;
  description?: string;
  metadata?: MetaData;
};

export type CreateRefundParams = {
  payment?: string;
  amount?: number;
  currency?: string;
  reason?: RefundReason;
  reference?: string;
  description?: string;
  lineItems?: string[];
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type UpdateRefundParams = {
  id?: string;
  reference?: string;
  description?: string;
  metadata?: MetaData;
};

export type CreateWebhookEndpointParams = {
  url?: string;
  description?: string;
  eventSubscriptions?: string[];
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type UpdateWebhookEndpointParams = CreateWebhookEndpointParams & {
  id?: string;
  active?: boolean;
};

export type CreateCouponParams = {
  name?: string;
  currency?: string;
  description?: string;
  discountAmount?: number;
  discountPercentage?: number;
  discountType?: string;
  expiresAt?: number;
  maxRedemptionCount?: number;
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type UpdateCouponParams = {
  id?: string;
  active?: boolean;
  name?: string;
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type CreatePromotionCodeParams = {
  active?: boolean;
  code?: string;
  coupon?: string;
  currency?: string;
  expiresAt?: number;
  firstTimeTransaction?: boolean;
  onePerCustomer?: boolean;
  maxRedemptionCount?: number;
  minimumAmount?: number;
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type UpdatePromotionCodeParams = {
  id?: string;
  active?: boolean;
  metadata?: MetaData;
  idempotencyKey?: string;
};

export type DeleteObjectParams = {
  id?: string;
};

export type Collection<T> = {
  object: string;
  pageToken: string;
  nextPageToken?: string;
  maxResults: number;
  results: number;
  data: Array<T>;
};

export type CalculateWebhookSignatureParams = {
  data: string;
  secret: string;
};

export type VerifyWebhookSignatureParams = CalculateWebhookSignatureParams & {
  signature: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorDetail = any;
export type ErrorDetails = ErrorDetail[];

export {};
