import type { KeyString, ChekoutSessionPayload } from './types';
export declare const isValidPublicApiKey: (apiKey: KeyString) => boolean;
export declare const isValidSecretApiKey: (apiKey: KeyString) => boolean;
export declare const isValidOrderId: (orderId: string) => boolean;
export declare const isValidCheckoutPayload: (payload: ChekoutSessionPayload) => import("jtd").ValidationError[];
