export type KeyString = string;

export type SmartPayOptions = {
  publicKey?: KeyString;
  apiPrefix?: string;
  checkoutURL?: string;
};

export type Address = {
  line1: string;
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  subLocality?: string;
  locality?: string;
  administrativeArea: string;
  postalCode: string;
  country: string;
};

export type ConsumerData = {
  emailAddress: string;
  name1: string;
  name2: string;
  name1Kana: string;
  name2Kana: string;
  address: Address;
  phoneNumber: string;
  dateOfBirth?: string;
  legalGender?: string;
  reference?: string;
};

export type OrderItem = {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  quantity: number;
};

export type ChekoutSessionPayload = {
  amount: number;
  consumerData: ConsumerData;
  orderItems: OrderItem[];
};

export type CheckoutSessionResult = {
  id: string;
};

export type Order = {
  id: string;
  status: string;
};

export {};
