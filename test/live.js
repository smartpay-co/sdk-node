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
        amount: 350,
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

    captureMethod: 'manual',

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successUrl: 'https://smartpay.co',
    cancelUrl: 'https://smartpay.co',
  };

  const session = await smartpay.createCheckoutSession(payload);

  TestSessionData.cancelOrderSession = session;

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
  const PAYMENT_AMOUNT = 150;

  t.plan(8);

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
    cancelRemainder: 'manual',
  });

  const payment2 = await smartpay.capture({
    order: orderId,
    amount: PAYMENT_AMOUNT + 1,
    currency: 'JPY',
    cancelRemainder: 'manual',
  });

  t.ok(payment1.id);
  t.ok(payment2.id);
  t.ok(payment2.amount === PAYMENT_AMOUNT + 1);

  const updatedPayment2 = await smartpay.updatePayment({
    id: payment2.id,
    reference: 'updated',
  });

  const retrivedPayment2 = await smartpay.getPayment({
    id: payment2.id,
  });

  t.ok(payment2.id === retrivedPayment2.id);
  t.ok(payment2.id === updatedPayment2.id);
  t.ok(payment2.amount === retrivedPayment2.amount);
  t.ok(retrivedPayment2.reference === 'updated');

  const paymentsCollection = await smartpay.listPayments();

  t.ok(paymentsCollection.data.length > 0);
});

test('Create refund', async function testCreateRefunds(t) {
  const orderId = TestSessionData.manualCaptureSession.order.id;
  const REFUND_AMOUNT = 1;

  t.plan(7);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const order = await smartpay.getOrder({ id: orderId });
  const refundablePayment = order.payments[0];
  const refund1 = await smartpay.createRefund({
    payment: refundablePayment,
    amount: REFUND_AMOUNT,
    currency: 'JPY',
    reason: Smartpay.REFUND_REQUEST_BY_CUSTOMER,
  });
  const refund2 = await smartpay.createRefund({
    payment: refundablePayment,
    amount: REFUND_AMOUNT + 1,
    currency: 'JPY',
    reason: Smartpay.REFUND_REQUEST_BY_CUSTOMER,
  });

  t.ok(refund1 && refund1.amount === REFUND_AMOUNT);
  t.ok(refund2 && refund2.amount === REFUND_AMOUNT + 1);

  const updatedRefund2 = await smartpay.updateRefund({
    id: refund2.id,
    reference: 'updated',
  });

  const retrivedRefund2 = await smartpay.getRefund({
    id: refund2.id,
  });

  t.ok(refund2.id === updatedRefund2.id);
  t.ok(refund2.id === retrivedRefund2.id);
  t.ok(refund2.amount === retrivedRefund2.amount);
  t.ok(retrivedRefund2.reference === 'updated');

  const refundsCollection = await smartpay.listRefunds();

  t.ok(refundsCollection.data.length > 0);
});

test('Create cancel', async function testCancelOrder(t) {
  const orderId = TestSessionData.cancelOrderSession.order.id;

  t.plan(1);

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

  const result = await smartpay.cancelOrder({ id: orderId });

  t.ok(result.status === 'canceled');
});

test('Webhook Endpoint CRUD', async function testWebhookEndpointCRUD(t) {
  t.plan(5);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const webhookEndpoint = await smartpay.createWebhookEndpoint({
    url: 'https://smartpay.co',
    eventSubscriptions: ['merchant_user.created'],
  });

  const updatedWebhookEndpoint = await smartpay.updateWebhookEndpoint({
    id: webhookEndpoint.id,
    description: 'updated',
  });

  const retrivedWebhookEndpoint = await smartpay.updateWebhookEndpoint({
    id: updatedWebhookEndpoint.id,
  });

  t.ok(webhookEndpoint.id);
  t.ok(webhookEndpoint.id === updatedWebhookEndpoint.id);
  t.ok(retrivedWebhookEndpoint.description === 'updated');

  const webhookEndpointsCollection = await smartpay.listWebhookEndpoints();

  t.ok(webhookEndpointsCollection.data.length > 0);

  const deleteResult = await smartpay.deleteWebhookEndpoint({
    id: updatedWebhookEndpoint.id,
  });

  t.ok(deleteResult === '');
});

test('Coupon, Promotion Code CRU', async function testWebhookEndpointCRUD(t) {
  t.plan(8);

  // Coupon
  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const coupon = await smartpay.createCoupon({
    name: 'E2E Test coupon',
    discountType: Smartpay.COUPON_DISCOUNT_TYPE_AMOUNT,
    discountAmount: 100,
    currency: 'JPY',
  });

  const updatedCoupon = await smartpay.updateCoupon({
    id: coupon.id,
    name: 'updatedCoupon',
  });

  const retrivedCoupon = await smartpay.updateCoupon({
    id: updatedCoupon.id,
  });

  t.ok(coupon.id);
  t.ok(coupon.id === updatedCoupon.id);
  t.ok(retrivedCoupon.name === 'updatedCoupon');

  const couponsCollection = await smartpay.listCoupons();

  t.ok(couponsCollection.data.length > 0);

  // Promotion Code
  const promotionCode = await smartpay.createPromotionCode({
    coupon: updatedCoupon.id,
    code: `THECODE${new Date().getTime()}`,
  });

  const updatedPromotionCode = await smartpay.updatePromotionCode({
    id: promotionCode.id,
    active: false,
  });

  const retrivedPromotionCode = await smartpay.updatePromotionCode({
    id: updatedPromotionCode.id,
  });

  t.ok(promotionCode.id);
  t.ok(promotionCode.id === updatedPromotionCode.id);
  t.ok(retrivedPromotionCode.active === false);

  const promotionCodesCollection = await smartpay.listPromotionCodes();

  t.ok(promotionCodesCollection.data.length > 0);
});
