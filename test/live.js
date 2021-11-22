import test from 'tape';

import Smartpay from '../build/esm/index.js';

const TEST_SECRET_KEY = 'sk_test_KTGPODEMjGTJByn1pu8psb';
const TEST_PUBLIC_KEY = 'pk_test_7smSiNAbAwsI2HKQE9e3hA';

test('Create Live Checkout Session Loose Payload', async function testCreateCheckoutSession(t) {
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

test('Create Live Checkout Session Strict Payload', async function testCreateCheckoutSession(t) {
  t.plan(1);

  const smartpay = new Smartpay(TEST_SECRET_KEY, {
    publicKey: TEST_PUBLIC_KEY,
  });

  const payload = {
    orderData: {
      lineItemData: [
        {
          priceData: {
            productData: {
              name: 'ナイキ エア ズーム テンポ ...',
              description: 'メンズ ランニングシューズ',
              images: ['https://i.ibb.co/vJRf12N/Item-image.png'],
            },
            amount: 100,
            currency: 'JPY',
          },
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
    },

    customerInfo: {
      emailAddress: 'john@smartpay.co',
      firstName: 'John',
      lastName: 'Doe',
      firstNameKana: 'ジョン',
      lastNameKana: 'ドエ',
      phoneNumber: '+818000000000',
      dateOfBirth: '2000-01-01',
      legalGender: 'male',
      address: {
        line1: 'line1',
        line2: 'line2',
        locality: '世田谷区',
        administrativeArea: '東京都',
        postalCode: '155-0031',
        country: 'JP',
      },
      accountAge: 30,
    },

    // Your internal reference of the order
    reference: 'order_ref_1234567',
    successURL: 'https://smartpay.co',
    cancelURL: 'https://smartpay.co',

    metadata: {
      foo: 'bar',
    },
  };

  const session = await smartpay.createCheckoutSession(payload);

  console.log(session); // eslint-disable-line no-console

  t.ok(session.id.length > 0);
});
