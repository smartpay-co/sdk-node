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
import { validate } from 'jtd';
import checkoutPayloadSchema from './schemas/checkout-payload.js';
var publicKeyRegExp = /^pk_(test|live)_[0-9a-zA-Z]+$/;
var secretKeyRegExp = /^sk_(test|live)_[0-9a-zA-Z]+$/;
var orderIdRegExp = /^order_[0-9a-zA-Z]+$/;
export var isValidPublicApiKey = function (apiKey) {
    return publicKeyRegExp.test(apiKey);
};
export var isValidSecretApiKey = function (apiKey) {
    return secretKeyRegExp.test(apiKey);
};
export var isValidOrderId = function (orderId) {
    return orderIdRegExp.test(orderId);
};
export var isValidCheckoutPayload = function (payload) {
    return validate(checkoutPayloadSchema, payload);
};
export var normalizeCheckoutPayload = function (input) {
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
