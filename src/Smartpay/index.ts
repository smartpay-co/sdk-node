import SmartpayBase from './base';
import ordersMixin from './orders';
import paymentsMixin from './payments';
import refundsMixin from './refunds';
import webhooksMixin from './webhooks';

const mixins = [ordersMixin, paymentsMixin, refundsMixin, webhooksMixin];

const Smartpay = mixins.reduce(
  (previousClass, mixin) => mixin(previousClass),
  SmartpayBase
);

export default Smartpay;
