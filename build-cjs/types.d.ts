export declare type KeyString = string;
export declare type SmartPayOptions = {
    publicKey?: KeyString;
    apiPrefix?: string;
    checkoutURL?: string;
};
export declare type Address = {
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
export declare type ConsumerData = {
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
export declare type lineItem = {
    name: string;
    description: string;
    image?: string;
    price: number;
    currency: string;
    quantity: number;
};
export declare type ChekoutSessionPayload = {
    amount?: number;
    currency?: string;
    consumerData?: ConsumerData;
    lineItems: lineItem[];
};
export declare type CheckoutSessionResult = {
    id: string;
};
export declare type Order = {
    id: string;
    status: string;
};
export {};
