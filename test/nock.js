import nock from 'nock';
import test from 'tape';

import Smartpay from '../build/esm/index.js';

const API_PREFIX = 'https://api.smartpay.co';
const CHECKOUT_URL = 'https://checkout.smartpay.co';

const TEST_SECRET_KEY = 'sk_test_a7SlBkzf44tzdQoTwm6FrW';
const TEST_PUBLIC_KEY = 'pk_test_1m2ySnST0aYi6QM0GlKP0n';

const FAKE_SESSION = {
  id: 'cs_live_abcdef12345678',
};

test('Create Fake Checkout Session', async function testCreateCheckoutSession(t) {
  t.plan(2);

  const scope = nock(API_PREFIX, {
    reqheaders: {
      authorization: `Basic ${TEST_SECRET_KEY}`,
    },
  })
    .post('/checkout/sessions')
    .reply(200, JSON.stringify(FAKE_SESSION));

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    apiPrefix: API_PREFIX,
    checkoutURL: CHECKOUT_URL,
  });

  const payload = {
    items: [
      {
        name: 'レブロン 18 LOW',
        price: 250,
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
    reference: 'order_ref_1234567', // Your internal reference of the order
    successURL: 'https://smartpay.co',
    cancelURL: 'https://smartpay.co',
  };
  const session = await smartpay.createCheckoutSession(payload);

  t.equal(session.id, FAKE_SESSION.id);
  t.ok(scope.isDone());
});
