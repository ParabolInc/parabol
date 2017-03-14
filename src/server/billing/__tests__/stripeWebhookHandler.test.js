import stripeWebhookHandler from 'server/billing/stripeWebhookHandler';
import * as invoicePaymentFailed from 'server/billing/handlers/invoicePaymentFailed';
import * as customerSourceUpdated from 'server/billing/handlers/customerSourceUpdated';
import * as invoiceItemCreated from 'server/billing/handlers/invoiceItemCreated';
import * as invoiceCreated from 'server/billing/handlers/invoiceCreated';
import * as customerSubscriptionUpdated from 'server/billing/handlers/customerSubscriptionUpdated';
import * as invoicePaymentSucceeded from 'server/billing/handlers/invoicePaymentSucceeded';
import customerSourceUpdatedEvent from 'server/billing/__tests__/events/customerSourceUpdatedEvent';
import invoiceCreatedEvent from 'server/billing/__tests__/events/invoiceCreatedEvent';
import customerSubscriptionUpdatedEvent from 'server/billing/__tests__/events/customerSubscriptionUpdatedEvent';
import invoiceItemCreatedEvent from 'server/billing/__tests__/events/invoiceItemCreatedEvent';
import invoicePaymentSucceededEvent from 'server/billing/__tests__/events/invoicePaymentSucceededEvent';
import invoicePaymentFailedEvent from 'server/billing/__tests__/events/invoicePaymentFailedEvent';
import exchange from 'server/__mocks__/exchange';

const mockRes = () => ({
  sendStatus: jest.fn()
});

describe('stripeWebhookHandler', () => {
  test('handles invoice.created webhooks', async () => {
    // SETUP
    const objectId = invoiceCreatedEvent.data.object.id;
    const req = {body: invoiceCreatedEvent};

    const res = mockRes();
    const mockFn = invoiceCreated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(exchange)(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles invoiceitem.created webhooks', async () => {
    // SETUP
    const objectId = invoiceItemCreatedEvent.data.object.id;
    const req = {body: invoiceItemCreatedEvent};

    const res = mockRes();
    const mockFn = invoiceItemCreated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(exchange)(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles customer.source.updated webhooks', async () => {
    // SETUP
    // const objectId = customerSourceUpdatedEvent.data.object.id;
    const customerId = customerSourceUpdatedEvent.data.object.customer;
    const req = {body: customerSourceUpdatedEvent};

    const res = mockRes();
    const mockFn = customerSourceUpdated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(exchange)(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(customerId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles invoice.payment_failed webhooks', async () => {
    // SETUP
    const objectId = invoicePaymentFailedEvent.data.object.id;
    const req = {body: invoicePaymentFailedEvent};

    const res = mockRes();
    const mockFn = invoicePaymentFailed.default = jest.fn();

    // TEST
    await stripeWebhookHandler(exchange)(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles invoice.payment_succeeded webhooks', async () => {
    // SETUP
    const objectId = invoicePaymentSucceededEvent.data.object.id;
    const req = {body: invoicePaymentSucceededEvent};

    const res = mockRes();
    const mockFn = invoicePaymentSucceeded.default = jest.fn();

    // TEST
    await stripeWebhookHandler(exchange)(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId);
    expect(res.sendStatus).toBeCalledWith(200);
  });

  test('handles customer.subscription.updated webhooks', async () => {
    // SETUP
    const objectId = customerSubscriptionUpdatedEvent.data.object.id;
    const {status} = customerSubscriptionUpdatedEvent.data.previous_attributes;
    const req = {body: customerSubscriptionUpdatedEvent};
    const res = mockRes();
    const mockFn = customerSubscriptionUpdated.default = jest.fn();

    // TEST
    await stripeWebhookHandler(exchange)(req, res);

    // VERIFY
    expect(mockFn).toBeCalledWith(objectId, status, exchange);
    expect(res.sendStatus).toBeCalledWith(200);
  });
});

