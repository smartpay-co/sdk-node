"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCheckoutPayload = exports.isValidCheckoutPayload = exports.isValidOrderId = exports.isValidSecretApiKey = exports.isValidPublicApiKey = void 0;
var jtd_1 = require("jtd");
var checkout_payload_js_1 = __importDefault(require("./schemas/checkout-payload.js"));
var publicKeyRegExp = /^pk_(test|live)_[0-9a-zA-Z]+$/;
var secretKeyRegExp = /^sk_(test|live)_[0-9a-zA-Z]+$/;
var orderIdRegExp = /^order_[0-9a-zA-Z]+$/;
var isValidPublicApiKey = function (apiKey) {
    return publicKeyRegExp.test(apiKey);
};
exports.isValidPublicApiKey = isValidPublicApiKey;
var isValidSecretApiKey = function (apiKey) {
    return secretKeyRegExp.test(apiKey);
};
exports.isValidSecretApiKey = isValidSecretApiKey;
var isValidOrderId = function (orderId) {
    return orderIdRegExp.test(orderId);
};
exports.isValidOrderId = isValidOrderId;
var isValidCheckoutPayload = function (payload) {
    return jtd_1.validate(checkout_payload_js_1.default, payload);
};
exports.isValidCheckoutPayload = isValidCheckoutPayload;
var normalizeCheckoutPayload = function (input) {
    var payload = __assign({}, input);
    if (!payload.currency) {
        payload.currency = input.lineItems[0].currency;
    }
    if (!payload.amount) {
        payload.amount = input.lineItems.reduce(function (sum, item) {
            if (item.currency !== payload.currency) {
                throw new Error('Currency of all items should be the same.');
            }
            return sum + item.price;
        }, 0);
    }
    return payload;
};
exports.normalizeCheckoutPayload = normalizeCheckoutPayload;
