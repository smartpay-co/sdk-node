import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import jsonfile from 'jsonfile';
import nock from 'nock';
import test from 'tape';

import Smartpay from '../build/esm/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = jsonfile.readFileSync(resolve(__dirname, '../package.json'));

const SMARTPAY_API_PREFIX =
  process.env.SMARTPAY_API_PREFIX?.toLowerCase()?.includes('api.smartpay')
    ? process.env.SMARTPAY_API_PREFIX
    : '';

const API_PREFIX = SMARTPAY_API_PREFIX || 'https://api.smartpay.co/v1';
const CHECKOUT_URL = 'https://checkout.smartpay.co';

const TEST_SECRET_KEY = 'sk_test_a7SlBkzf44tzdQoTwm6FrW';
const TEST_PUBLIC_KEY = 'pk_test_1m2ySnST0aYi6QM0GlKP0n';

const FAKE_SESSION = {
  id: 'cs_live_abcdef12345678',
  // eslint-disable-next-line max-len
  url: 'https://checkout.smartpay.co/checkout_live_vptIEMeycBuKLNNVRL6kB2.1ntK1e.2Z9eoI1j1KU7Jz7XMA9t9wU6gKI4ByzfUSJcwZAhYDoZWPr46ztb1F1ZcsBc7J4QmifNzmcNm4eVHSO98sMVzg',
};

test('Create Fake Checkout Session', async function testCreateCheckoutSession(t) {
  t.plan(2);

  const scope = nock(API_PREFIX, {
    reqheaders: {
      authorization: `Basic ${TEST_SECRET_KEY}`,
    },
  })
    .post(`/checkout-sessions?dev-lang=nodejs&sdk-version=${pkg.version}`)
    .reply(200, FAKE_SESSION);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
    apiPrefix: API_PREFIX,
    checkoutURL: CHECKOUT_URL,
  });

  const payload = {
    items: [
      {
        name: 'レブロン 18 LOW',
        amount: 250,
        currency: 'JPY',
        quantity: 1,
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
    reference: 'order_ref_1234567', // Your internal reference of the order
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',
  };
  const session = await smartpay.createCheckoutSession(payload);

  t.equal(session.id, FAKE_SESSION.id);
  t.ok(scope.isDone());
});
