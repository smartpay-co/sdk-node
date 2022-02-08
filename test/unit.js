import test from 'tape';

import Smartpay from '../build/esm/index.js';

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

  const sessionURL = smartpay.getSessionURL(FAKE_SESSION);

  t.ok(sessionURL.indexOf(CHECKOUT_URL) === 0);
  t.ok(sessionURL.indexOf(`public-key=${TEST_PUBLIC_KEY}`) > 0);
  t.ok(sessionURL.indexOf(`session-id=${FAKE_SESSION.id}`) > 0);
});

test('Promotion Code', function testPromotionCode(t) {
  t.plan(3);

  const CODE1 = 'ABCDE12345';

  const payload = {
    currency: 'JPY',

    items: [
      {
        name: 'Item',
        amount: 100,
        quantity: 2,
      },
    ],

    shippingInfo: {
      address: {
        line1: 'line1',
        locality: 'locality',
        postalCode: '123',
        country: 'JP',
      },
    },

    reference: 'order_ref_1234567',
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',

    promotionCode: CODE1,
  };

  const normalizePayload = Smartpay.normalizeCheckoutSessionPayload(payload);

  t.ok(normalizePayload.amount === 200);
  t.ok(normalizePayload.promotionCode === CODE1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    checkoutURL: CHECKOUT_URL,
  });

  const sessionURL = smartpay.getSessionURL(FAKE_SESSION, {
    promotionCode: CODE1,
  });

  t.ok(sessionURL.indexOf(`promotion-code=${CODE1}`) > 0);
});

test('Test Validate Checkout Session Payload', function testGetSessionURL(t) {
  t.plan(2);

  const payload1 = {
    shippingInfo: {
      address: {
        line1: 'line1',
        locality: 'locality',
        postalCode: '123',
        country: 'JP',
      },
    },

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',
  };

  try {
    Smartpay.normalizeCheckoutSessionPayload(payload1);
  } catch (error1) {
    t.ok(error1.details?.includes('Currency is not available.'));
  }

  const payload2 = {
    currency: 'JPY',
    items: [],
    customer: {
      accountAge: 20,
      email: 'linmic+test@smartpay.co',
      firstName: '田中',
      lastName: '太郎',
      firstNameKana: 'タナカ',
      lastNameKana: 'タロウ',
      address: {
        line1: '北青山 3-6-7',
        line2: '青山パラシオタワー 11階',
        subLocality: '',
        locality: '港区',
        administrativeArea: '東京都',
        postalCode: '107-0061',
        country: 'JP',
      },
      dateOfBirth: '1985-06-30',
      gender: 'male',
    },
    shippingInfo: {
      address: {
        line1: '北青山 3-6-7',
        line2: '青山パラシオタワー 11階',
        subLocality: '',
        locality: '港区',
        administrativeArea: '東京都',
        postalCode: '107-0061',
        country: 'JP',
      },
      feeAmount: 150,
      feeCurrency: 'JPY',
    },
    reference: 'order_ref_1234567',
    successUrl: 'https://docs.smartpay.co/example-pages/checkout-successful',
    cancelUrl: 'https://docs.smartpay.co/example-pages/checkout-canceled',
    promotionCode: 'SPRINGSALE2022',
  };

  try {
    Smartpay.normalizeCheckoutSessionPayload(payload2);
  } catch (error2) {
    t.ok(error2.details?.includes('payload.items is required.'));
  }
});
