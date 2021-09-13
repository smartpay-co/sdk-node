// Code generated by jtd-codegen for TypeScript v0.2.0

export interface CheckoutSessionPayload {
  cancelURL: string;
  successURL: string;
  amount?: number;
  currency?: string;
  customer?: Customer;
  customerInfo?: Customer;
  items?: LineItem[];
  lineItemData?: LineItem[];
  orderData?: Order;
  reference?: string;
  shipping?: Address;
}

export interface Address {
  country: string;
  line1: string;
  locality: string;
  postalCode: string;
  administrativeArea?: string;
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  subLocality?: string;
}

export interface Customer {
  emailAddress: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: Address;
  dateOfBirth?: string;
  firstNameKana?: string;
  lastNameKana?: string;
  legalGender?: string;
  reference?: string;
}

export interface LineItem {
  currency: string;
  name: string;
  quantity: number;
  amount?: number;
  brand?: string;
  categories?: string[];
  description?: string;
  gtin?: string;
  image?: string;
  images?: string[];
  label?: string;
  priceData?: Price;
  priceDescription?: string;
  productDescription?: string;
  reference?: string;
  url?: string;
}

export interface OrderShippingInfo {
  address: Address;
  addressType: string;
}

export interface Order {
  amount: number;
  currency: string;
  lineItemData: LineItem[];
  shippingInfo: OrderShippingInfo;
}

export interface Price {
  amount: number;
  currency: string;
  product: Product;
  description?: string;
  label?: string;
}

export interface Product {
  name: string;
  brand?: string;
  categories?: string[];
  description?: string;
  gtin?: string;
  images?: string[];
  reference?: string;
  url?: string;
}
