import test from 'tape';

import Smartpay from '../build/index.js';

const CHECKOUT_URL = 'https://checkout.smartpay.co';

const TEST_SECRET_KEY = 'sk_test_a7SlBkzf44tzdQoTwm6FrW';
const TEST_PUBLIC_KEY = 'pk_test_1m2ySnST0aYi6QM0GlKP0n';

const FAKE_SESSION = {
  id: 'cs_live_abcdef12345678',
};

test('Get Session URL', function testGetSessionURL(t) {
  t.plan(3);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    checkoutURL: CHECKOUT_URL,
  });

  const { data: sessionURL } = smartpay.getSessionURL(FAKE_SESSION);

  t.ok(sessionURL.indexOf(CHECKOUT_URL) === 0);
  t.ok(sessionURL.indexOf(`key=${TEST_PUBLIC_KEY}`) > 0);
  t.ok(sessionURL.indexOf(`session=${FAKE_SESSION.id}`) > 0);
});

test('Test Validate Checkout Session Payload', function testGetSessionURL(t) {
  t.plan(2);

  const payload1 = {
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

  const { error: error1 } = Smartpay.normalizeCheckoutSessionPayload(payload1);

  t.ok(error1.details?.includes('payload.orderData is invalid'));

  const payload2 = {
    shipping: {
      line1: 'line1',
      locality: 'locality',
      postalCode: '123',
      country: 'JP',
    },

    items: [],

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successURL: 'https://smartpay.co',
    cancelURL: 'https://smartpay.co',
  };

  const { error: error2 } = Smartpay.normalizeCheckoutSessionPayload(payload2);

  t.ok(
    error2.details?.includes('payload.orderData.lineItemnData is required.')
  );
});
