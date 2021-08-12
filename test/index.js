import nock from 'nock';
import test from 'tape';

import Smartpay from '../build/index.js';

const API_PREFIX = 'https://api.smartpay.co/checkout';

const TEST_SECRET_KEY = 'sk_test_albwlejgsekcokfpdmva';
const TEST_PUBLIC_KEY = 'pk_test_albwlejgsekcokfpdmva';

test('Create Checkout Session', async function testCreateCheckoutSession(t) {
  t.plan(2);

  const fakeSession = {
    id: 'cs_live_abcdef12345678',
  };

  const scope = nock(API_PREFIX, {
    reqheaders: {
      authorization: `Bearer ${TEST_SECRET_KEY}`,
    },
  })
    .post('/sessions')
    .reply(200, JSON.stringify(fakeSession));

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });
  const payload = {
    lineItems: [
      {
        name: 'レブロン 18 LOW',
        price: 19250,
        currency: 'JPY',
        quantity: 1,
      },
    ],

    // Your internal reference of the order
    reference: 'order_ref_1234567',
  };
  const session = await smartpay.createCheckoutSession(payload);

  t.equal(session.id, fakeSession.id);
  t.ok(scope.isDone());
});
