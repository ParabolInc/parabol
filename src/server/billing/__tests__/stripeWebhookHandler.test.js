import stripeWebhookHandler from 'server/billing/stripeWebhookHandler';
import * as  invoiceCreated from 'server/billing/handlers/invoiceCreated';

const makeReq = (objectId, type) => ({
  body: {
    data: {
      object: {
        id: objectId
      }
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
    const req = makeReq(objectId, type);

    const res = mockRes();
    const mockFn = invoiceCreated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });
});

