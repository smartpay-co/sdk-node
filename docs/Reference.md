# Smartpay NodeJS SDK Reference

- [Class Smartpay](#class-smartpay)
  - [Constructor](#constructor)
  - [Create Checkout Session](#create-checkout-session)
  - [Get Checkout Session](#get-checkout-session)
  - [List Checkout Sessions](#list-checkout-sessions)
  - [Get Checkout Session URL](#get-checkout-session-url)
  - [Get Order](#get-order)
  - [Cancel Order](#cancel-order)
  - [List Orders](#list-orders)
  - [Create Payment](#create-payment)
  - [Get Payment](#get-payment)
  - [Update Payment](#update-payment)
  - [List Payments](#list-payments)
  - [Create Refund](#create-refund)
  - [Get Refund](#get-refund)
  - [Update Refund](#update-refund)
  - [List Refunds](#list-refunds)
  - [Get Webhook Endpoint](#get-webhook-endpoint)
  - [Update Webhook Endpoint](#update-webhook-endpoint)
  - [Delete Webhook Endpoint](#delete-webhook-endpoint)
  - [List Webhook Endpoints](#list-webhook-endpoints)
  - [Calculate Webhook Signature](#calculate-webhook-signature)
  - [Verify Webhook Signature](#verify-webhook-signature)
  - [Webhook Express Middleware](#webhook-express-middleware)
  - [Get Coupon](#get-coupon)
  - [Update Coupon](#update-coupon)
  - [List Coupons](#list-coupons)
  - [Get Promotion Code](#get-promotion-code)
  - [Update Promotion Code](#update-promotion-code)
  - [List Promotion Codes](#list-promotion-codes)
- [Collection](#collection)
  - [Properties](#properties)
- [Constants](#constants)
  - [Address Type](#address-type)
  - [Capture Method](#capture-method)
  - [Order Status](#order-status)
  - [Cancel Remainder](#cancel-remainder)
  - [Refund Reason](#refund-reason)
  - [Discount Type](#discount-type)
- [Common Exceptions](#common-exceptions)

## Class Smartpay

The main class.

### Constructor

```javascript
const smartpay = new Smartpay(secretKey, {
  publicKey,
});
```

#### Arguments

| Name                 | Type   | Description                            |
| -------------------- | ------ | -------------------------------------- |
| secretKey            | String | The secret key from merchant dashboard |
| publicKey (optional) | String | The public key from merchant dashboard |

#### Return

Smartpay class instance. Methods documented below.

#### Exceptions

| Type  | Description            |
| ----- | ---------------------- |
| Error | Secret Key is required |
| Error | Secret Key is invalid  |
| Error | Public Key is invalid  |

### Create Checkout Session

Create a checkout session.

```javascript
const session = await smartpay.createCheckoutSession(payload);
```

#### Arguments

| Name    | Type   | Description                                                                      |
| ------- | ------ | -------------------------------------------------------------------------------- |
| payload | Object | The checkout session payload, [strict][strict-payload] or [loose][loose-payload] |

[strict-payload]: https://ja.docs.smartpay.co/reference/create-a-checkout-session
[loose-payload]: https://github.com/smartpay-co/sdk-node/blob/main/docs/SimpleCheckoutSession.md

#### Return

The [checkout session object][]

### Get Checkout Session

**Async** method, get single checkout session object by checkout session id.

```javascript
const checkoutSession await smartpay.getCheckoutSession({ id });
```

#### Arguments

| Name | Type   | Description             |
| ---- | ------ | ----------------------- |
| id   | String | The checkout session id |

#### Return

[CheckoutSession object][]

#### Exceptions

[Common exceptions][]

### List Checkout Sessions

**Static** method, list checkout session objects.

```javascript
const checkoutSessionsCollection = await smartpay.listCheckoutSessions({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [checkout session object][]

#### Exceptions

[Common exceptions][]

### Get Checkout Session URL

**Static** method, return the checkout URL of the checkout session.

```javascript
const url = Smartpay.getSessionUrl(session, {
  promotionCode,
});
```

#### Arguments

| Name                     | Type   | Description                              |
| ------------------------ | ------ | ---------------------------------------- |
| session                  | String | The checkout session object              |
| promotionCode (optional) | String | The promotion code which will auto apply |

#### Return

The checkout URL of the checkout session. ex:

```
https://checkout.smartpay.co/checkout_live_vptIEMeycBuKLNNVRL6kB2.1ntK1e.2Z9eoI1j1KU7Jz7XMA9t9wU6gKI4ByzfUSJcwZAhYDoZWPr46ztb1F1ZcsBc7J4QmifNzmcNm4eVHSO98sMVzg
```

### Get Order

**Async** method, get single order object by order id.

```javascript
const order = await smartpay.getOrder({ id });
```

#### Arguments

| Name | Type   | Description  |
| ---- | ------ | ------------ |
| id   | String | The order id |

#### Return

[Order object][]

#### Exceptions

[Common exceptions][]

### Cancel Order

**Async** method, cancel an order.

```javascript
await smartpay.cancelOrder({ id: });
```

#### Arguments

| Name | Type   | Description  |
| ---- | ------ | ------------ |
| id   | String | The order id |

#### Return

[Order object][]

#### Exceptions

[Common exceptions][]

### List Orders

**Static** method, list order objects.

```javascript
const ordersCollection = await smartpay.listOrders({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [order object][]

#### Exceptions

[Common exceptions][]

### Create Payment

**Async** method, create a payment object([capture][]) to an order.

```javascript
const payment = await smartpay.createPayment({
  order,
  amount,
  currency,
  cancelRemainder,
  lineitems,
  reference,
  description,
  metadata,
});
```

#### Arguments

| Name                                          | Type     | Description                                                                                              |
| --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| order                                         | String   | The order id                                                                                             |
| amount                                        | Number   | The amount of the payment                                                                                |
| currency                                      | String   | Three-letter ISO currency code, in uppercase. Must be a supported currency.                              |
| cancelRemainder (optional, default=automatic) | Stirng   | Whether to cancel remaining amount in case of a partial capture. `automatic` or `manual`.                |
| lineitems (optional)                          | String[] | A list of the IDs of the Line Items of the original Payment this Refund is on.                           |
| reference (optional)                          | String   | A string to reference the Payment which can be used to reconcile the Payment with your internal systems. |
| description (optional)                        | String   | An arbitrary long form explanation of the Payment, meant to be displayed to the customer.                |
| metadata (optional)                           | Object   | Set of up to 20 key-value pairs that you can attach to the object.                                       |

#### Return

[Payment object][]

#### Exceptions

[Common exceptions][]

| Type          | Error Code                 | Description                                                           |
| ------------- | -------------------------- | --------------------------------------------------------------------- |
| SmartpayError | `order.not-found`          | No order was found meeting the requirements.                          |
| SmartpayError | `order.cannot-capture`     | No payment can be created. The error message will include the reason. |
| SmartpayError | `payment.excessive-amount` | The payment exceeds the order's amount available for capture          |

### Get Payment

**Async** method, get the payment object by payment id.

```javascript
const payment = await smartpay.getPayment({
  id,
});
```

#### Arguments

| Name | Type   | Description    |
| ---- | ------ | -------------- |
| id   | String | The payment id |

#### Return

[Payment object][]

#### Exceptions

[Common exceptions][]

### Update Payment

**Async** method, create a payment object([capture][]) to an order.

```javascript
const payment = await smartpay.updatePayment({
  id,
  reference,
  description,
  metadata,
});
```

#### Arguments

| Name                   | Type   | Description                                                                                              |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| id                     | String | The order id                                                                                             |
| reference (optional)   | String | A string to reference the Payment which can be used to reconcile the Payment with your internal systems. |
| description (optional) | String | An arbitrary long form explanation of the Payment, meant to be displayed to the customer.                |
| metadata (optional)    | Object | Set of up to 20 key-value pairs that you can attach to the object.                                       |

#### Return

[Payment object][]

#### Exceptions

[Common exceptions][]

### List Payments

**Async** method, list the payment objects.

```javascript
const payment = await smartpay.listPayments({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [payment object][]

#### Exceptions

[Common exceptions][]

### Create Refund

**Async** method, create a refund object([refund][]) to a payment.

```javascript
const refund = await smartpay.createRefund({
  payment,
  amount,
  currency,
  reason,
  lineitems,
  reference,
  description,
  metadata,
});
```

#### Arguments

| Name                   | Type     | Description                                                                                              |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| id                     | String   | The payment id                                                                                           |
| amount                 | Number   | The amount of the refund                                                                                 |
| currency               | String   | The order id                                                                                             |
| reason                 | Stirng   | The reason of the Refund. `requested_by_customer` or `fraudulent`                                        |
| lineitems (optional)   | String[] | A list of the IDs of the Line Items of the original Payment this Refund is on.                           |
| reference (optional)   | String   | A string to reference the Payment which can be used to reconcile the Payment with your internal systems. |
| description (optional) | String   | An arbitrary long form explanation of the Payment, meant to be displayed to the customer.                |
| metadata (optional)    | Object   | Set of up to 20 key-value pairs that you can attach to the object.                                       |

#### Return

[Refund object][]

#### Exceptions

[Common exceptions][]

| Type          | Error Code            | Description                                                        |
| ------------- | --------------------- | ------------------------------------------------------------------ |
| SmartpayError | `payment.not-found`   | No payment was found meeting the requirements.                     |
| SmartpayError | `amount.insufficient` | Available amount on payment is insufficient to handle the request. |

### Get Refund

**Async** method, get the refund object by refund id.

```javascript
const refund = await smartpay.getRefund({
  id,
});
```

#### Arguments

| Name | Type   | Description   |
| ---- | ------ | ------------- |
| id   | String | The refund id |

#### Return

[Refund object][]

#### Exceptions

[Common exceptions][]

### Update Refund

**Async** method, update a refund object([capture][]).

```javascript
const refund = await smartpay.updateRefund({
  id,
  reference,
  description,
  metadata,
});
```

#### Arguments

| Name                   | Type   | Description                                                                                              |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| id                     | String | The refund id                                                                                            |
| reference (optional)   | String | A string to reference the Payment which can be used to reconcile the Payment with your internal systems. |
| description (optional) | String | An arbitrary long form explanation of the Payment, meant to be displayed to the customer.                |
| metadata (optional)    | Object | Set of up to 20 key-value pairs that you can attach to the object.                                       |

#### Return

[Refund object][]

#### Exceptions

[Common exceptions][]

### List Refunds

**Async** method, list refunds.

```javascript
const refunds = await smartpay.listRefunds({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [refund object][]

#### Create Webhook Endpoint

**Async** method, create a webhook endpoint object.

```javascript
const webhookEndpoint = await smartpay.createWebhookEndpoint({
  url,
  eventSubscriptions,
  description,
  metadata,
});
```

#### Arguments

| Name                   | Type     | Description                                                                                        |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| url                    | String   | The url which will be called when any of the events you subscribed to occur.                       |
| eventSubscriptions     | String[] | The list of events to subscribe to. If not specified you will be subsribed to all events.          |
| description (optional) | String   | An arbitrary long form explanation of the Webhook Endpoint, meant to be displayed to the customer. |
| metadata (optional)    | Object   | Set of up to 20 key-value pairs that you can attach to the object.                                 |

#### Return

[Webhook Endpoint object][]

#### Exceptions

[Common exceptions][]

### Get Webhook Endpoint

**Async** method, get the webhook endpoint object by webhook endpoint id.

```javascript
const webhookEndpoint = await smartpay.getWebhookEndpoint({
  id,
});
```

#### Arguments

| Name | Type   | Description             |
| ---- | ------ | ----------------------- |
| id   | String | The webhook endpoint id |

#### Return

[Webhook Endpoint object][]

#### Exceptions

[Common exceptions][]

### Update Webhook Endpoint

**Async** method, update a webhook endpoint.

```javascript
const webhookEndpoint = await smartpay.updateWebhookEndpoint({
  active,
  url,
  eventSubscriptions,
  description,
  metadata,
});
```

#### Arguments

| Name                          | Type     | Description                                                                                        |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| id                            | String   | The order id                                                                                       |
| active (optional)             | Boolean  | Has the value true if the webhook endpoint is active and events are sent to the url specified.     |
| url (optional)                | String   | The url which will be called when any of the events you subscribed to occur.                       |
| eventSubscriptions (optional) | String[] | The list of events to subscribe to. If not specified you will be subsribed to all events.          |
| description (optional)        | String   | An arbitrary long form explanation of the Webhook Endpoint, meant to be displayed to the customer. |
| metadata (optional)           | Object   | Set of up to 20 key-value pairs that you can attach to the object.                                 |

#### Return

[Webhook Endpoint object][]

#### Exceptions

[Common exceptions][]

### Delete Webhook Endpoint

**Async** method, get the webhook endpoint object by webhook endpoint id.

```javascript
const webhookEndpoint = await smartpay.deleteWebhookEndpoint({
  id,
});
```

#### Arguments

| Name | Type   | Description             |
| ---- | ------ | ----------------------- |
| id   | String | The webhook endpoint id |

#### Return

Empty response body with 204

#### Exceptions

[Common exceptions][]

### List Webhook Endpoints

**Async** method, list the webhook endpoint objects.

```javascript
const webhookEndpoint = await smartpay.listWebhookEndpoints({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [webhook endpoint object][]

#### Exceptions

[Common exceptions][]

### Calculate Webhook Signature

**Static** method, calculate the signature for webhook event of the given data.

```javascript
const signature = Smartpay.calculateWebhookSignature({
  data,
  secret,
});
```

#### Arguments

| Name   | Type   | Description                       |
| ------ | ------ | --------------------------------- |
| data   | String | The data string                   |
| secret | String | The Base62 encoded signing secret |

#### Return

Signature of the data.

### Verify Webhook Signature

**Static** method, calculate the signature of the given data.

```javascript
const signature = Smartpay.calculateWebhookSignature({
  data,
  secret,
  signature,
});
```

#### Arguments

| Name      | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| data      | String | The data string                   |
| secret    | String | The Base62 encoded signing secret |
| signature | String | The expected signature value      |

#### Return

Boolean value, `true` if the signatures are matching.

### Webhook Express Middleware

This method is designed to be the verify function of `express.json` middleware.
Which will append a new header `calculated-signature` to the Request object.
You can use the value to compare with the value of `smartpay-signature` header.

```javascript
const app = require('express')();
const Smartpay = require('@smartpay/sdk-node').default;
const secret = process.env.SIGNING_SECRET;

app.use(
  express.json({
    verify: Smartpay.verifyExpressWebhook(secret),
  })
);
```

#### Arguments

| Name   | Type               | Description                                                                                                     |
| ------ | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| secret | String \| Function | The Base62 encoded signing secret string. Or a function which returns the secret `(subscription_id) => secret`. |

#### Returns

A `express.json` middleware's verify function.

#### Create Coupon

**Async** method, create a coupon object.

```javascript
const coupon = await smartpay.createCoupon({
  name,
  metadata,
});
```

#### Arguments

| Name                          | Type   | Description                                                                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| name                          | String | The coupon's name, meant to be displayable to the customer.                                                        |
| discountType                  | String | Discount Type. `amount` or `percentage`                                                                            |
| discountAmount                | Number | Required if discountType is `amount`. The amount of this coupon object.                                            |
| discountPercentage            | Number | Required if discountType is `percentage`. The discount percentage of this coupon object.                           |
| currency                      | String | Required if discountType is `amount`. Three-letter ISO currency code, in uppercase. Must be a supported currency.  |
| expiresAt (optional)          | String | Time at which the Coupon expires. Measured in milliseconds since the Unix epoch.                                   |
| maxRedemptionCount (optional) | String | Maximum number of times this coupon can be redeemed, in total, across all customers, before it is no longer valid. |
| metadata (optional)           | Object | Set of up to 20 key-value pairs that you can attach to the object.                                                 |

#### Return

[Coupon object][]

#### Exceptions

[Common exceptions][]

### Get Coupon

**Async** method, get the coupon object by coupon id.

```javascript
const coupon = await smartpay.getCoupon({
  id,
});
```

#### Arguments

| Name | Type   | Description   |
| ---- | ------ | ------------- |
| id   | String | The coupon id |

#### Return

[Coupon object][]

#### Exceptions

[Common exceptions][]

### Update Coupon

**Async** method, update a coupon.

```javascript
const coupon = await smartpay.updateCoupon({
  active,
  metadata,
});
```

#### Arguments

| Name                | Type    | Description                                                                          |
| ------------------- | ------- | ------------------------------------------------------------------------------------ |
| id                  | String  | The order id                                                                         |
| name (optional)     | String  | The coupon's name, meant to be displayable to the customer.                          |
| active (optional)   | Boolean | Has the value true if the coupon is active and events are sent to the url specified. |
| metadata (optional) | Object  | Set of up to 20 key-value pairs that you can attach to the object.                   |

#### Return

[Coupon object][]

#### Exceptions

[Common exceptions][]

### List Coupons

**Async** method, list the coupon objects.

```javascript
const coupon = await smartpay.listCoupons({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [coupon object][]

#### Exceptions

[Common exceptions][]

#### Create Promotion Code

**Async** method, create a promotion code object of a coupon.

```javascript
const promotionCode = await smartpay.createPromotionCode({
  name,
  metadata,
});
```

#### Arguments

| Name                            | Type    | Description                                                                                                                                                    |
| ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| coupon                          | String  | The unique identifier for the Coupon object.                                                                                                                   |
| code                            | String  | The customer-facing code. Regardless of case, this code must be unique across all your promotion codes.                                                        |
| active (optional)               | Boolean | Has the value true (default) if the promotion code is active and can be used, or the value false if it is not.                                                 |
| currency (optional)             | String  | Three-letter ISO currency code, in uppercase. Must be a supported currency.                                                                                    |
| expiresAt (optional)            | Number  | Time at which the Promotion Code expires. Measured in milliseconds since the Unix epoch.                                                                       |
| firstTimeTransaction (optional) | Boolean | A Boolean indicating if the Promotion Code should only be redeemed for customers without any successful order with the merchant. Defaults to false if not set. |
| maxRedemptionCount (optional)   | Number  | Maximum number of times this Promotion Code can be redeemed, in total, across all customers, before it is no longer valid.                                     |
| minimumAmount (optional)        | Number  | The minimum amount required to redeem this Promotion Code (e.g., the amount of the order must be ¥10,000 or more to be applicable).                            |
| onePerCustomer (optional)       | Boolean | A Boolean indicating if the Promotion Code should only be redeemed once by any given customer. Defaults to false if not set.                                   |
| metadata (optional)             | Object  | Set of up to 20 key-value pairs that you can attach to the object.                                                                                             |

#### Return

[Promotion Code object][]

#### Exceptions

[Common exceptions][]

| Type          | Error Code              | Description                                                                                               |
| ------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| SmartpayError | `coupon.not-found`      | No coupon was found meeting the requirements.                                                             |
| SmartpayError | `promotion-code.exists` | The promotion code {code} already exists. The code needs to be unique across all of your promotion codes. |

### Get Promotion Code

**Async** method, get the promotion code object by promotion code id.

```javascript
const promotionCode = await smartpay.getPromotionCode({
  id,
});
```

#### Arguments

| Name | Type   | Description           |
| ---- | ------ | --------------------- |
| id   | String | The promotion code id |

#### Return

[Promotion Code object][]

#### Exceptions

[Common exceptions][]

### Update Promotion Code

**Async** method, update a promotion code.

```javascript
const promotionCode = await smartpay.updatePromotionCode({
  active,
  metadata,
});
```

#### Arguments

| Name                | Type    | Description                                                                                 |
| ------------------- | ------- | ------------------------------------------------------------------------------------------- |
| id                  | String  | The order id                                                                                |
| active (optional)   | Boolean | Has the value true if the promotion codeis active and events are sent to the url specified. |
| metadata (optional) | Object  | Set of up to 20 key-value pairs that you can attach to the object.                          |

#### Return

[Promotion Code object][]

#### Exceptions

[Common exceptions][]

### List Promotion Codes

**Async** method, list the promotion code objects.

```javascript
const promotionCode = await smartpay.listPromotionCodes({
  maxResults,
  pageToken,
  expand,
});
```

#### Arguments

| Name                              | Type   | Description                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| maxResults (optional, defualt=20) | Number | Number of objects to return.                                                               |
| pageToken (optional)              | String | The token for the page of the collection of objects.                                       |
| expand (optional, default=no)     | String | Set to `all` if the references within the response need to be expanded to the full objects |

#### Return

[Collection][] of [promotion code object][]

#### Exceptions

[Common exceptions][]

## Collection

Collection of items, a general data structure of collection data.

### Properties

| Name          | Type   | Description                                                                                                                        |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| object        | String | Always be `collection`                                                                                                             |
| pageToken     | String | The token for the page of the collection of objects.                                                                               |
| nextPageToken | String | The token for the next page of the collection of objects.                                                                          |
| maxResults    | Number | The maximum number of objects returned for this call. Equals to the maxResults query parameter specified (or 20 if not specified). |
| results       | Number | The actual number of objects returned for this call. This value is less than or equal to maxResults.                               |
| data          | Array  | The array of data                                                                                                                  |

## Constants

### Address Type

```
Smartpay.ADDRESS_TYPE_HOME
Smartpay.ADDRESS_TYPE_GIFT
Smartpay.ADDRESS_TYPE_LOCKER
Smartpay.ADDRESS_TYPE_OFFICE
Smartpay.ADDRESS_TYPE_STORE
```

### Capture Method

```
Smartpay.CAPTURE_METHOD_AUTOMATIC
Smartpay.CAPTURE_METHOD_MANUAL
```

### Order Status

```
Smartpay.ORDER_STATUS_SUCCEEDED
Smartpay.ORDER_STATUS_CANCELED
Smartpay.ORDER_STATUS_REJECTED
Smartpay.ORDER_STATUS_FAILED
Smartpay.ORDER_STATUS_REQUIRES_AUTHORIZATION
```

### Cancel Remainder

```
Smartpay.CANCEL_REMAINDER_AUTOMATIC
Smartpay.CANCEL_REMAINDER_MANUAL
```

### Refund Reason

```
Smartpay.REFUND_REQUEST_BY_CUSTOMER
Smartpay.REFUND_FRAUDULENT
```

### Discount Type

```
Smartpay.COUPON_DISCOUNT_TYPE_AMOUNT
Smartpay.COUPON_DISCOUNT_TYPE_PERCENTAGE
```

## Common Exceptions

| Type          | Error Code                   | Description                    |
| ------------- | ---------------------------- | ------------------------------ |
| SmartpayError | `unexpected_error`           | Unexpected network issue.      |
| SmartpayError | `unexpected_error`           | Unable to parse response body. |
| SmartpayError | `request.invalid`            | Required argument is missing.  |
| SmartpayError | Error code from API response | Unable to parse response body. |

[checkout session object]: https://en.docs.smartpay.co/reference/the-checkout-session-object
[order object]: https://ja.docs.smartpay.co/reference/the-order-object
[payment object]: https://en.docs.smartpay.co/reference/the-payment-object
[refund object]: https://en.docs.smartpay.co/reference/the-refund-object
[webhook endpoint object]: https://en.docs.smartpay.co/reference/the-webhook-endpoint-object
[coupon object]: https://en.docs.smartpay.co/reference/the-coupon-object
[promotion code object]: https://en.docs.smartpay.co/reference/the-promotion-code-object
[capture]: https://en.docs.smartpay.co/docs/capture-an-order#using-the-smartpay-api
[refund]: https://en.docs.smartpay.co/docs/refund-a-purchase#using-the-smartpay-api
[collection]: #collection
[common exceptions]: #common-exceptions
