import stripeWebhookHandler from 'server/billing/stripeWebhookHandler';
import * as invoicePaymentFailed from 'server/billing/handlers/invoicePaymentFailed';
import * as customerSourceUpdated from 'server/billing/handlers/customerSourceUpdated';
import * as invoiceItemCreated from 'server/billing/handlers/invoiceItemCreated';
import * as invoiceCreated from 'server/billing/handlers/invoiceCreated';
import * as customerSubscriptionUpdated from 'server/billing/handlers/customerSubscriptionUpdated';
import * as invoicePaymentSucceeded from 'server/billing/handlers/invoicePaymentSucceeded';

const makeReq = (object, type) => ({
  body: {
    data: {
      object
    },
    type
  }
});

const mockRes = () => ({
  sendStatus: jest.fn()
});

describe('stripeWebhookHandler', () => {
  test('handles invoice.created webhooks', async() => {
    // SETUP
    const objectId = 'invoiceId';
    const type = 'invoice.created';
    const req = makeReq({id: objectId}, type);

    const res = mockRes();
    const mockFn = invoiceCreated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles invoiceitem.created webhooks', async() => {
    // SETUP
    const objectId = 'invoiceItemId';
    const type = 'invoiceitem.created';
    const req = makeReq({id: objectId}, type);

    const res = mockRes();
    const mockFn = invoiceItemCreated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles customer.source.updated webhooks', async() => {
    // SETUP
    const objectId = 'sourceId';
    const customerId = 'customerId';
    const type = 'customer.source.updated';
    const req = makeReq({id: objectId, customer: customerId}, type);

    const res = mockRes();
    const mockFn = customerSourceUpdated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId, customerId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles invoice.payment_failed webhooks', async() => {
    // SETUP
    const objectId = 'invoiceId';
    const type = 'invoice.payment_failed';
    const req = makeReq({id: objectId}, type);

    const res = mockRes();
    const mockFn = invoicePaymentFailed.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles invoice.payment_succeeded webhooks', async() => {
    // SETUP
    const objectId = 'invoiceId';
    const type = 'invoice.payment_succeeded';
    const req = makeReq({id: objectId}, type);

    const res = mockRes();
    const mockFn = invoicePaymentSucceeded.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles customer.subscription.updated webhooks', async() => {
    // SETUP
    const objectId = 'customerId';
    const status = 'trialing';
    const type = 'customer.subscription.updated';
    const req = makeReq({id: objectId}, type);
    req.body.data.previous_attributes = {status};
    const res = mockRes();
    const mockFn = customerSubscriptionUpdated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId, status);
    expect(res.sendStatus).toBeCalledWith(200);
  });
});

