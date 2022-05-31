import { createHmac } from 'crypto';

import basex from 'base-x';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request, Response } from 'express';

import {
  CalculateWebhookSignatureParams,
  VerifyWebhookSignatureParams,
  CreateWebhookEndpointParams,
  UpdateWebhookEndpointParams,
  DeleteObjectParams,
  ListParams,
  GetObjectParams,
  WebhookEndpoint,
  Collection,
} from '../types';
import { isValidWebhookEndpointId, omit, SmartpayError } from '../utils';

import { GET, POST, PATCH, DELETE, Constructor } from './base';

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const base62 = basex(BASE62);

const webhooksMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    createWebhookEndpoint(params: CreateWebhookEndpointParams = {}) {
      const { url } = params;

      if (!url) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'URL is required',
        });
      }

      const req: Promise<WebhookEndpoint> = this.request(`/webhook-endpoints`, {
        method: POST,
        idempotencyKey: params.idempotencyKey,
        payload: omit(params, ['idempotencyKey']),
      });

      return req;
    }

    getWebhookEndpoint(params: GetObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Webhook Endpoint Id is required',
        });
      }

      if (!isValidWebhookEndpointId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Webhook Endpoint Id is invalid',
        });
      }

      const req: Promise<WebhookEndpoint> = this.request(
        `/webhook-endpoints/${id}`,
        {
          method: GET,
          params: omit(params, ['id']),
        }
      );

      return req;
    }

    updateWebhookEndpoint(params: UpdateWebhookEndpointParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Webhook Endpoint Id is required',
        });
      }

      if (!isValidWebhookEndpointId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Webhook Endpoint Id is invalid',
        });
      }

      const req: Promise<WebhookEndpoint> = this.request(
        `/webhook-endpoints/${id}`,
        {
          method: PATCH,
          payload: omit(params, ['id']),
        }
      );

      return req;
    }

    deleteWebhookEndpoint(params: DeleteObjectParams = {}) {
      const { id } = params;

      if (!id) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Webhook Endpoint Id is required',
        });
      }

      if (!isValidWebhookEndpointId(id)) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'Webhook Endpoint Id is invalid',
        });
      }

      const req: Promise<string> = this.request(`/webhook-endpoints/${id}`, {
        method: DELETE,
      });

      return req;
    }

    listWebhookEndpoints(params: ListParams = {}) {
      const req: Promise<Collection<WebhookEndpoint>> = this.request(
        `/webhook-endpoints`,
        {
          method: GET,
          params,
        }
      );

      return req;
    }

    static calculateWebhookSignature(params: CalculateWebhookSignatureParams) {
      const { data, secret } = params;

      if (!data) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'data is required',
        });
      }

      if (!secret) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'secret is required',
        });
      }

      const signer = createHmac('sha256', Buffer.from(base62.decode(secret)));
      const result = signer.update(Buffer.from(data, 'utf8')).digest('hex');

      return result;
    }

    static verifyWebhookSignature(params: VerifyWebhookSignatureParams) {
      const { data, secret, signature } = params;

      if (!data) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'data is required',
        });
      }

      if (!secret) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'secret is required',
        });
      }

      if (!signature) {
        throw new SmartpayError({
          errorCode: 'request.invalid',
          message: 'signature is required',
        });
      }

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
