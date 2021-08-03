import fetch from "isomorphic-unfetch";
import qs from "query-string";
import { isValidPublicApiKey, isValidSecretApiKey, isValidCheckoutPayload, } from "./utils";
var API_PREFIX = "https://api.smartpay.co/checkout";
var CHECKOUT_URL = "https://checkout.smartpay.ninja";
var POST = "POST";
var PUT = "PUT";
var DELETE = "DELETE";
var SmartPay = /** @class */ (function () {
    function SmartPay(key, options) {
        if (options === void 0) { options = {}; }
        if (!key) {
            throw new Error("Secret API Key is required.");
        }
        if (!isValidSecretApiKey(key)) {
            throw new Error("Secret API Key is invalid.");
        }
        if (options.publicKey && !isValidPublicApiKey(options.publicKey)) {
            throw new Error("Public API Key is invalid.");
        }
        this._secretKey = key;
        this._publicKey = options.publicKey;
        this._apiPrefix = options.apiPrefix || API_PREFIX;
        this._checkoutURL = options.checkoutURL || CHECKOUT_URL;
    }
    SmartPay.prototype.request = function (endpoint, method, payload) {
        if (method === void 0) { method = "GET"; }
        return fetch("" + this._apiPrefix + endpoint, {
            method: method,
            headers: {
                Authorization: "Bearer " + this._secretKey,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: payload ? JSON.stringify(payload) : null,
        }).then(function (response) {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        });
    };
    SmartPay.prototype.createCheckoutSession = function (payload) {
        if (!isValidCheckoutPayload(payload)) {
            throw new Error("Checkout Payload is invalid.");
        }
        // Call API to create checkout session
        return this.request("/sessions", POST, payload);
    };
    SmartPay.prototype.isOrderAuthorized = function (orderId) {
        return this.getOrder(orderId).then(function (order) { return order.status === "succeeded"; });
    };
    SmartPay.prototype.getOrders = function () {
        return this.request("/orders");
    };
    SmartPay.prototype.getOrder = function (orderId) {
        return this.request("/orders/" + orderId);
    };
    // captureOrder(orderId: string, amount: number) {
    //   return this.request(`/orders/${orderId}/capture`, POST, { amount });
    // }
    SmartPay.prototype.refundOrder = function (orderId, amount) {
        return this.request("/orders/" + orderId + "/refund", POST, { amount: amount });
    };
    // cancelOrder(orderId: string) {
    //   return this.request(`/orders/${orderId}/cancel`, POST);
    // }
    SmartPay.prototype.setPublicKey = function (publicKey) {
        if (!publicKey) {
            throw new Error("Public API Key is required.");
        }
        if (!isValidPublicApiKey(publicKey)) {
            throw new Error("Public API Key is invalid.");
        }
        this._publicKey = publicKey;
    };
    SmartPay.prototype.generateRedirectionTarget = function (checkoutSessionId) {
        if (!checkoutSessionId) {
            throw new Error("Checkout Session ID is required.");
        }
        if (!this._publicKey) {
            throw new Error("Public API Key is required.");
        }
        var params = {
            session: checkoutSessionId,
            key: this._publicKey,
        };
        return qs.stringifyUrl({
            url: this._checkoutURL + "/login",
            query: params,
        });
    };
    return SmartPay;
}());
export default SmartPay;
