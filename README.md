<div id="top"></div>

<br />
<div align="center">
  <a href="https://github.com/smartpay-co/sdk-node">
		<picture>
			<source media="(prefers-color-scheme: dark)" srcset="https://assets.smartpay.co/logo/banner/smartpay-logo-dark.png" />
			<source media="(prefers-color-scheme: light)" srcset="https://assets.smartpay.co/logo/banner/smartpay-logo.png" />
			<img alt="Smartpay" src="https://assets.smartpay.co/logo/banner/smartpay-logo.png" style="width: 797px;" />
		</picture>
  </a>

  <p align="center">
    <a href="https://docs.smartpay.co/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/smartpay-co/sdk-node/issues">Report Bug</a>
    ·
    <a href="https://github.com/smartpay-co/sdk-node/issues">Request Feature</a>
  </p>
</div>

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

The shape of checkout session payload is described in the [docuement](https://en.docs.smartpay.co/reference/create-a-checkout-session).

### To retreive the session URL

```javascript
const sessionURL = smartpay.getSessionURL(session);
```

We also prepare a more [real-world example](https://github.com/smartpay-co/integration-examples/blob/main/server/node/server.js) for you to refer to.

## Reference

Please check the [reference](docs/Reference.md) document.
