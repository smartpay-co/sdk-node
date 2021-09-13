import nock from 'nock';
import test from 'tape';

import Smartpay from '../build/index.js';

const API_PREFIX = 'https://api.smartpay.re/smartpayments';
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
  });

  const payload = {
    items: [
      {
        name: 'レブロン 18 LOW',
        priceAmount: 19250,
        currency: 'JPY',
        quantity: 1,
      },
    ],

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successURL: 'https://smartpay.co',
    cancelURL: 'https://smartpay.co',
  };
  const { data: session } = await smartpay.createCheckoutSession(payload);

  t.equal(session.id, FAKE_SESSION.id);
  t.ok(scope.isDone());
});

test('Get Session URL', function testGetSessionURL(t) {
  t.plan(3);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    checkoutURL: CHECKOUT_URL,
  });

  const sessionURL = smartpay.getSessionURL(FAKE_SESSION);

  t.ok(sessionURL.indexOf(CHECKOUT_URL) === 0);
  t.ok(sessionURL.indexOf(`key=${TEST_PUBLIC_KEY}`) > 0);
  t.ok(sessionURL.indexOf(`session=${FAKE_SESSION.id}`) > 0);
});
