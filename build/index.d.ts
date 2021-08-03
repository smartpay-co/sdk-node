import type { KeyString, SmartPayOptions, ChekoutSessionPayload, CheckoutSessionResult, Order } from "./types";
declare type Method = "GET" | "POST" | "PUT" | "DELETE";
declare class SmartPay {
    _secretKey: KeyString;
    _publicKey?: KeyString;
    _apiPrefix: string;
    _checkoutURL: string;
    constructor(key: KeyString, options?: SmartPayOptions);
    request(endpoint: string, method?: Method, payload?: any): Promise<any>;
    createCheckoutSession(payload: ChekoutSessionPayload): Promise<CheckoutSessionResult>;
    isOrderAuthorized(orderId: string): Promise<boolean>;
    getOrders(): Promise<Order[]>;
    getOrder(orderId: string): Promise<Order>;
    refundOrder(orderId: string, amount: number): Promise<any>;
    setPublicKey(publicKey: KeyString): void;
    generateRedirectionTarget(checkoutSessionId: string): string;
}
export default SmartPay;
