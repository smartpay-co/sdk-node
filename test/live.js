import test from 'tape';

import Smartpay from '../build/esm/index.js';

const TEST_SECRET_KEY = 'sk_test_KTGPODEMjGTJByn1pu8psb';
const TEST_PUBLIC_KEY = 'pk_test_7smSiNAbAwsI2HKQE9e3hA';

test('Create Live Checkout Session Loose Payload 1', async function testCreateCheckoutSession(t) {
  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const payload = {
    currency: 'JPY',

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

      feeAmount: 100,
      feeCurrency: 'JPY',
    },

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',
  };

  const session = await smartpay.createCheckoutSession(payload);

  console.log(session); // eslint-disable-line no-console

  t.ok(session.id.length > 0);
});

test('Create Live Checkout Session Loose Payload 2', async function testCreateCheckoutSession(t) {
  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
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

      feeAmount: 100,
      feeCurrency: 'JPY',
    },

    customerInfo: {
      email: 'john@smartpay.co',
      firstName: 'John',
      lastName: 'Doe',
    },

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',
  };

  const session = await smartpay.createCheckoutSession(payload);

  console.log(session); // eslint-disable-line no-console

  t.ok(session.id.length > 0);
});

test('Get orders', async function testGetOrders(t) {
  t.plan(2);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const orderCollection = await smartpay.getOrders();

  t.ok(orderCollection.data.length > 0);

  const firstOrder = orderCollection.data[0];

  const order = await smartpay.getOrder(firstOrder.id);

  t.ok(order.id === firstOrder.id);
});
