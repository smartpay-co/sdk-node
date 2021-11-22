import test from 'tape';

import Smartpay from '../build/esm/index.js';

const TEST_SECRET_KEY = 'sk_test_KTGPODEMjGTJByn1pu8psb';
const TEST_PUBLIC_KEY = 'pk_test_7smSiNAbAwsI2HKQE9e3hA';

test('Create Live Checkout Session', async function testCreateCheckoutSession(t) {
  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
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

      feeAmount: 100,
      feeCurrency: 'JPY',
    },

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successURL: 'https://smartpay.co',
    cancelURL: 'https://smartpay.co',
  };

  const session = await smartpay.createCheckoutSession(payload);

  console.log(session); // eslint-disable-line no-console

  t.ok(session.id.length > 0);
});
