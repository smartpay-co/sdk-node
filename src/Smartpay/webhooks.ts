import { createHmac } from 'crypto';

import basex from 'base-x';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request, Response } from 'express';

import {
  CalculateWebhookSignatureParams,
  VerifyWebhookSignatureParams,
} from '../types';

import { Constructor } from './base';

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const base62 = basex(BASE62);

const webhooksMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    static calculateWebhookSignature(params: CalculateWebhookSignatureParams) {
      const { data, secret } = params;
      const signer = createHmac('sha256', Buffer.from(base62.decode(secret)));
      const result = signer.update(Buffer.from(data, 'utf8')).digest('hex');

      return result;
    }

    static verifyWebhookSignature(params: VerifyWebhookSignatureParams) {
      const { data, secret, signature } = params;
      const calculatedSignature = this.calculateWebhookSignature({
        data,
        secret,
      });

      return signature === calculatedSignature;
    }

    static expressWebhookMiddleware(secret: string | Function) {
      return (req: Request, res: Response, buf: Buffer) => {
        if (req.headers['smartpay-signature']) {
          const subscriptionId = req.headers['smartpay-subscription-id'];
          const signingSecret =
            typeof secret === 'string' ? secret : secret(subscriptionId);
          const signer = createHmac(
            'sha256',
            Buffer.from(base62.decode(signingSecret))
          );
          const signatureTimestamp =
            req.headers['smartpay-signature-timestamp'];
          const result = signer
            .update(Buffer.from(`${signatureTimestamp}.`, 'utf8'))
            .update(buf)
            .digest('hex');

          req.headers['calculated-signature'] = result; // eslint-disable-line no-param-reassign
        }
      };
    }
  };
};

export default webhooksMixin;
