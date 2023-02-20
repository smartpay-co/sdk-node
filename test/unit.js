import test from 'tape';

import mockServer from './utils/retry-server.js';
import Smartpay from '../build/esm/index.js';

const CHECKOUT_URL = 'https://checkout.smartpay.co';
const TEST_SECRET_KEY = process.env.SECRET_KEY;
const TEST_PUBLIC_KEY = process.env.PUBLIC_KEY;

const FAKE_SESSION = {
  id: 'checkout_test_hm3tau0XY7r3ULm06pHtr8.1nsIwu',

  // eslint-disable-next-line max-len
  url: 'https://checkout.smartpay.co/checkout_test_hm3tau0XY7r3ULm06pHtr8.1nsIwu.9tR7VVYMmLWwq77hGPuN0HbPB6TYsPKLrJbJJkcIKiR8GUY0WalxEoRtBcWF6I1WYLGit6xiAlJtyi8xrXxDfD?demo=true&promotion-code=SPRINGSALE2022&',
};

test('Get Session URL', function testGetSessionURL(t) {
  t.plan(1);

  const sessionURL = Smartpay.getSessionURL(FAKE_SESSION);

  t.ok(sessionURL.indexOf(CHECKOUT_URL) === 0);
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

    // eslint-disable-next-line max-len
    url: 'https://checkout.smartpay.co/checkout_test_hm3tau0XY7r3ULm06pHtr8.1nsIwu.9tR7VVYMmLWwq77hGPuN0HbPB6TYsPKLrJbJJkcIKiR8GUY0WalxEoRtBcWF6I1WYLGit6xiAlJtyi8xrXxDfD?demo=true&promotion-code=SPRINGSALE2022&',
  };

  const normalizePayload = Smartpay.normalizeCheckoutSessionPayload(payload);

  t.ok(normalizePayload.amount === 200);
  t.ok(normalizePayload.promotionCode === CODE1);

  const sessionURL = Smartpay.getSessionURL(normalizePayload, {
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

test('Verify Webhook Signature Verification function', function testWebhookSignature(t) {
  t.plan(1);

  // eslint-disable-next-line max-len
  const data = `1653028612220.{"id":"evt_test_dwPfFKu5iSEKyHR2LFj9Lx","object":"event","createdAt":1653028523052,"test":true,"eventData":{"type":"payment.created","version":"2022-02-18","data":{"id":"payment_test_35LxgmF5KM22XKG38BjpJg","object":"payment","test":true,"createdAt":1653028523020,"updatedAt":1653028523020,"amount":200,"currency":"JPY","order":"order_test_RiYq2rthzRHrkKVGeucSwn","reference":"order_ref_1234567","status":"processed","metadata":{}}}}`;
  const signature =
    '68007ada8485ea0ceca7c5e879ae860a50412b7af95ab8e81b32a3e13f3c0832';
  const secret = 'gybcsjixKyBW2d4z6iNPlaYzHUMtawnodwZt3W0q';

  t.ok(Smartpay.verifyWebhookSignature({ data, signature, secret }));
});

test('Test retry policy', async function testRetryPolicy(t) {
  t.plan(2);

  mockServer.init();

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    apiPrefix: 'http://127.0.0.1:3001',
  });

  const res = await smartpay.request('/', {
    method: 'GET',
    retries: 5,
    retryOn: [500],
    retryDelay: 5,
  });

  t.equal(res, 'ok');

  const res2 = await smartpay.request('/', {
    method: 'GET',
    retries: 1,
    retryOn: [500],
    retryDelay: 5,
  });

  t.equal(res2, '');

  mockServer.close();
});
