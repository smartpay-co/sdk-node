import SmartpayBase from './base';
import checkoutSessionsMixin from './checkout-sessions';
import couponsMixin from './coupons';
import ordersMixin from './orders';
import paymentsMixin from './payments';
import promotionCodesMixin from './promotion-codes';
import refundsMixin from './refunds';
import webhooksMixin from './webhooks';

const mixins = [
  checkoutSessionsMixin,
  ordersMixin,
  paymentsMixin,
  refundsMixin,
  webhooksMixin,
  couponsMixin,
  promotionCodesMixin,
];

const Smartpay = mixins.reduce(
  (previousClass, mixin) => mixin(previousClass),
  SmartpayBase
);

export default Smartpay;
