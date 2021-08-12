import type { KeyString, ChekoutSessionPayload } from './types';
export declare const isValidPublicApiKey: (apiKey: KeyString) => boolean;
export declare const isValidSecretApiKey: (apiKey: KeyString) => boolean;
export declare const isValidOrderId: (orderId: string) => boolean;
export declare const isValidCheckoutPayload: (payload: ChekoutSessionPayload) => import("jtd").ValidationError[];
export declare const normalizeCheckoutPayload: (input: ChekoutSessionPayload) => {
    amount?: number | undefined;
    currency?: string | undefined;
    consumerData?: import("./types").ConsumerData | undefined;
    lineItems: import("./types").lineItem[];
};
