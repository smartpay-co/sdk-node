import SmartpayBase from './base';
import couponsMixin from './coupons';
import ordersMixin from './orders';
import paymentsMixin from './payments';
import promotionCodesMixin from './promotion-codes';
import refundsMixin from './refunds';
import webhooksMixin from './webhooks';

const mixins = [
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
