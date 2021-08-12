"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_SUCCEEDED = void 0;
var isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
var query_string_1 = __importDefault(require("query-string"));
var utils_js_1 = require("./utils.js");
var API_PREFIX = 'https://api.smartpay.co/checkout';
var CHECKOUT_URL = 'https://checkout.smartpay.ninja';
var POST = 'POST';
// const PUT = 'PUT';
// const DELETE = 'DELETE';
exports.STATUS_SUCCEEDED = 'succeeded';
var Smartpay = /** @class */ (function () {
    function Smartpay(key, options) {
        if (options === void 0) { options = {}; }
        if (!key) {
            throw new Error('Secret API Key is required.');
        }
        if (!utils_js_1.isValidSecretApiKey(key)) {
            throw new Error('Secret API Key is invalid.');
        }
        if (options.publicKey && !utils_js_1.isValidPublicApiKey(options.publicKey)) {
            throw new Error('Public API Key is invalid.');
        }
        this._secretKey = key;
        this._publicKey = options.publicKey;
        this._apiPrefix = options.apiPrefix || API_PREFIX;
        this._checkoutURL = options.checkoutURL || CHECKOUT_URL;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Smartpay.prototype.request = function (endpoint, method, payload) {
        if (method === void 0) { method = 'GET'; }
        return isomorphic_unfetch_1.default("" + this._apiPrefix + endpoint, {
            method: method,
            headers: {
                Authorization: "Bearer " + this._secretKey,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: payload ? JSON.stringify(payload) : null,
        }).then(function (response) {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        });
    };
    Smartpay.prototype.createCheckoutSession = function (payload) {
        var _this = this;
        if (!utils_js_1.isValidCheckoutPayload(payload)) {
            throw new Error('Checkout Payload is invalid.');
        }
        // Call API to create checkout session
        return this.request('/sessions', POST, utils_js_1.normalizeCheckoutPayload(payload)).then(function (session) {
            // eslint-disable-next-line no-param-reassign
            session.checkoutURL = _this.getSessionURL(session);
            return session;
        });
    };
    Smartpay.prototype.isOrderAuthorized = function (orderId) {
        return this.getOrder(orderId).then(function (order) { return order.status === exports.STATUS_SUCCEEDED; });
    };
    Smartpay.prototype.getOrders = function () {
        return this.request('/orders');
    };
    Smartpay.prototype.getOrder = function (orderId) {
        return this.request("/orders/" + orderId);
    };
    // captureOrder(orderId: string, amount: number) {
    //   return this.request(`/orders/${orderId}/capture`, POST, { amount });
    // }
    Smartpay.prototype.refundOrder = function (orderId, amount) {
        return this.request("/orders/" + orderId + "/refund", POST, { amount: amount });
    };
    // cancelOrder(orderId: string) {
    //   return this.request(`/orders/${orderId}/cancel`, POST);
    // }
    Smartpay.prototype.setPublicKey = function (publicKey) {
        if (!publicKey) {
            throw new Error('Public API Key is required.');
        }
        if (!utils_js_1.isValidPublicApiKey(publicKey)) {
            throw new Error('Public API Key is invalid.');
        }
        this._publicKey = publicKey;
    };
    Smartpay.prototype.getSessionURL = function (session) {
        if (!session) {
            throw new Error('Checkout Session is required.');
        }
        if (!this._publicKey) {
            throw new Error('Public API Key is required.');
        }
        var params = {
            session: session.id,
            key: this._publicKey,
        };
        return query_string_1.default.stringifyUrl({
            url: this._checkoutURL + "/login",
            query: params,
        });
    };
    return Smartpay;
}());
exports.default = Smartpay;
