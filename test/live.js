import test from 'tape';

import Smartpay from '../build/esm/index.js';

const API_PREFIX = 'https://api.smartpay.re/smartpayments';
const CHECKOUT_URL = 'https://checkout.smartpay.re';

const TEST_SECRET_KEY = 'sk_test_a7SlBkzf44tzdQoTwm6FrW';
const TEST_PUBLIC_KEY = 'pk_test_1m2ySnST0aYi6QM0GlKP0n';

test('Create Live Checkout Session', async function testCreateCheckoutSession(t) {
  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    apiPrefix: API_PREFIX,
    checkoutURL: CHECKOUT_URL,
  });

  const payload = {
    items: [
      {
        name: 'レブロン 18 LOW',
        price: 19250,
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
    successURL: 'https://smartpay.co',
    cancelURL: 'https://smartpay.co',
  };

  const session = await smartpay.createCheckoutSession(payload);

  t.ok(session.id.length > 0);
});
