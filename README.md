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

The package needs to be configured with your own API keys, you can find them on your [dashboard](https://dashboard.smartpay.co/settings/credentials).

```javascript
const Smartpay = require('@smartpay/sdk-node').default;

const smartpay = new Smartpay('<YOUR_SECRET_KEY>', {
  publicKey: '<YOUR_PUBLIC_KEY>',
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
    successUrl: 'https://docs.smartpay.co/example-pages/checkout-successful',
    cancelUrl: 'https://docs.smartpay.co/example-pages/checkout-canceled',

    test: true,
  };

  const session = await smartpay.createCheckoutSession(payload);
})();
```

We supports two formats of the checkout session payload. The first one is strict format. You will have the
full control to the session payload if you choose to use strict format. Please checkout the API [document][strict-session] for more information about the strict format.

The second supported format is loose format. This format is a less complexity version of the strict format.
Our SDK will transform the payload to strict format before sending to our API endpoint.

[strict-session]: https://documenter.getpostman.com/view/16470887/U16dSU8B#8a3538b1-530c-448c-8bae-4a41cdf0b8fd

### To retreive the session URL

```javascript
const sessionURL = smartpay.getSessionURL(session);
```

We also prepare a more [real-world example](https://github.com/smartpay-co/integration-examples/blob/main/server/node/server.js) for you to refer to.
