import { validate } from "jtd";
import payloadSchema from "./schemas/payload-schema";
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
    return validate(payloadSchema, payload);
};
