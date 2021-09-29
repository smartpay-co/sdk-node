# Smartpay Nodejs SDK

The Smartpay Nodejs SDK offers easy access to Smartpay API from applications written in Nodejs.

## Prerequisites

Nodejs v12+

## Installation

```shell
npm install --save @smartpay/sdk-node
# or
yarn add @smartpay/sdk-node
```

## Usage

The package needs to be configured with your own API keys, you can find them on your [dashboard](https://merchant.smartpay.co/settings/credentials).

```javascript
const smartpay = new Smartpay('<YOUR_PRIVATE_API_KEY>', {
  publicKey: '<YOUR_PUBLIC_API_KEY>',
});
```

If you would like to know how Smartpay payment works, please see the [payment flow](https://docs.smartpay.co/#payment_flow) for more details.

### Create Checkout session

```javascript
(async () => {
  const payload = {
    items: [
      {
        name: 'レブロン 18 LOW',
        amount: 250,
        currency: 'JPY',
        quantity: 1,
      },
    ],

    shipping: {
      line1: 'line1',
      locality: 'locality',
      postalCode: '123',
      country: 'JP',
    },

    // Your internal reference of the order
    reference: 'order_ref_1234567',

    // Callback URLs
    successURL: 'https://docs.smartpay.co/example-pages/checkout-successful',
    cancelURL: 'https://docs.smartpay.co/example-pages/checkout-canceled',

    test: true,
  };

  const session = smartpay.createCheckoutSession(payload);
})();
```

### To retreive the session URL

```javascript
const sessionURL = smartpay.getSessionURL(session);
```

We also prepare a more [real-world example](https://github.com/smartpay-co/integration-examples/blob/main/server/node/server.js) for you to refer to.
