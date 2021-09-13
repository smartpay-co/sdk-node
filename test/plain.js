import test from 'tape';

import Smartpay from '../build/index.js';

const API_PREFIX = 'https://api.smartpay.re/smartpayments';
const CHECKOUT_URL = 'https://checkout.smartpay.co';

const TEST_SECRET_KEY = 'sk_test_a7SlBkzf44tzdQoTwm6FrW';
const TEST_PUBLIC_KEY = 'pk_test_1m2ySnST0aYi6QM0GlKP0n';

test('Create Live Checkout Session', async function testCreateCheckoutSession(t) {
  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    apiPrefix: API_PREFIX,
  });

  const payload = {
    customer: {
      email: 'authorized@smartpay.co',
    },

    items: [
      {
        name: 'レブロン 18 LOW',
        amount: 19250,
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

  const { data: session } = await smartpay.createCheckoutSession(payload);

  console.log(session);

  t.ok(session.id.length > 0);
});
