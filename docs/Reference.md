# Smartpay NodeJS SDK Reference

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

### Get Orders

**Static** method, get orders collection of the merchant

```javascript
const ordersCollection = await smartpay.getOrders({ maxResults: 10 });
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

### Get Order

**Async** method, get single order object by order id.

```javascript
const order = await smartpay.getOrder({ id });
```

#### Arguments

| Name | Type   | Description  |
| ---- | ------ | ------------ |
| id   | string | The order id |

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
| id   | string | The order id |

#### Return

[Order object][]

#### Exceptions

[Common exceptions][]

### Payments

#### Create Payment

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
| id   | string | The payment id |

#### Return

[Payment object][]

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

### Refund reasons

```
Smartpay.REFUND_REQUEST_BY_CUSTOMER
```

```
Smartpay.REFUND_FRAUDULENT
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
[capture]: https://en.docs.smartpay.co/docs/capture-an-order#using-the-smartpay-api
[refund]: https://en.docs.smartpay.co/docs/refund-a-purchase#using-the-smartpay-api
[collection]: #collection
[common exceptions]: #common-exceptions