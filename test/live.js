import test from 'tape';
import sumBy from 'lodash.sumby';

import Smartpay from '../build/esm/index.js';

const TEST_SECRET_KEY = process.env.SECRET_KEY;
const TEST_PUBLIC_KEY = process.env.PUBLIC_KEY;

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

test('Create refund', async function testGetOrders(t) {
  const REFUND_AMOUNT = 1;

  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const ordersCollection = await smartpay.getOrders({
    maxResults: 100,
    expand: 'all',
  });
  const refundablePayment = ordersCollection.data.reduce((result, order) => {
    if (result) {
      return result;
    }

    if (order.status === 'succeeded') {
      const p = order.payments.find(
        (payment) => payment.amount > sumBy(payment.refunds, 'amount')
      );

      return p;
    }

    return result;
  }, null);

  const refund = await smartpay.createRefund({
    payment: refundablePayment.id,
    amount: REFUND_AMOUNT,
    currency: 'JPY',
    reason: 'requested_by_customer',
  });

  t.ok(refund && refund.amount === REFUND_AMOUNT);
});
