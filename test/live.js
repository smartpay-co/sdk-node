import fetch from 'isomorphic-unfetch';
import test from 'tape';

import Smartpay from '../build/esm/index.js';

const TEST_SECRET_KEY = process.env.SECRET_KEY;
const TEST_PUBLIC_KEY = process.env.PUBLIC_KEY;
const { TEST_USERNAME, TEST_PASSWORD } = process.env;

const TestSessionData = {};

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

    captureMethod: 'manual',

    reference: 'order_ref_1234567',
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',
  };

  const session = await smartpay.createCheckoutSession(payload);

  console.log(session); // eslint-disable-line no-console

  TestSessionData.manualCaptureSession = session;

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
  t.plan(3);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const ordersCollection = await smartpay.getOrders({ maxResults: 10 });

  t.ok(ordersCollection.data.length > 0);

  const { nextPageToken } = ordersCollection;

  if (nextPageToken) {
    const nextOrdersCollection = await smartpay.getOrders({
      pageToken: nextPageToken,
    });

    t.ok(nextOrdersCollection.data.length > 0);
  } else {
    t.ok(true);
  }

  const firstOrder = ordersCollection.data[0];

  const order = await smartpay.getOrder({ id: firstOrder.id });

  t.ok(order.id === firstOrder.id);
});

test('Create payment', async function testCreatePayment(t) {
  const orderId = TestSessionData.manualCaptureSession.order.id;
  const PAYMENT_AMOUNT = 50;

  t.plan(3);

  const loginResponse = await fetch(
    `https://${process.env.API_BASE}/consumers/auth/login`,
    {
      headers: {},
      body: `{"emailAddress":"${TEST_USERNAME}","password":"${TEST_PASSWORD}"}`,
      method: 'POST',
    }
  );
  const { accessToken } = await loginResponse.json();

  await fetch(
    `https://${process.env.API_BASE}/orders/${orderId}/authorizations`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: '{"paymentMethod":"pm_test_visaApproved","paymentPlan":"pay_in_three"}',
      method: 'POST',
    }
  );

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const payment1 = await smartpay.createPayment({
    order: orderId,
    amount: PAYMENT_AMOUNT,
    currency: 'JPY',
  });

  const payment2 = await smartpay.createPayment({
    order: orderId,
    amount: PAYMENT_AMOUNT,
    currency: 'JPY',
  });

  t.ok(payment1.id);
  t.ok(payment2.id);
  t.ok(payment2.amount === PAYMENT_AMOUNT);
});

test('Create refund', async function testCreateRefunds(t) {
  const orderId = TestSessionData.manualCaptureSession.order.id;
  const REFUND_AMOUNT = 1;

  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const order = await smartpay.getOrder({ id: orderId });
  const refundablePayment = order.payments[0];
  const refund = await smartpay.createRefund({
    payment: refundablePayment,
    amount: REFUND_AMOUNT,
    currency: 'JPY',
    reason: 'requested_by_customer',
  });

  t.ok(refund && refund.amount === REFUND_AMOUNT);
});
