/* eslint-env jest */
import DynamicSerializer from 'dynamic-serializer'
import MockDB from '../../../__tests__/setup/MockDB'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import stripe from '../../../billing/stripe'
import stripeWebhookHandler from '../../../billing/stripeWebhookHandler'
import getRethink from '../../../database/rethinkDriver'
import invoicePaymentFailedEvent from './mockStripeEvents/invoicePaymentFailedEvent'
import shortid from 'shortid'
import { PRO } from 'parabol-client/utils/constants'
import MockRes from '../../../__mocks__/MockRes'
import MockReq from '../../../__mocks__/MockReq'
import DataLoaderWarehouse from 'dataloader-warehouse'

console.error = jest.fn()

describe('stripeFailPayment', () => {
  test('handles invoice.payment_failed', async () => {
    // SETUP
    const invoiceId = `in_${shortid.generate()}`
    const res = new MockRes()
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { organization } = await mockDB.init({ plan: PRO }).newInvoice({ id: invoiceId })
    const org = organization[0]
    stripe.__setMockData(org)
    const req = new MockReq({
      body: invoicePaymentFailedEvent(invoiceId, org.stripeId, org.stripeSubscriptionId)
    })
    const subscription = stripe.__db.subscriptions[org.stripeSubscriptionId]
    const billingLeaderId = mockDB.db.user[0].id
    await stripe.invoices.create({
      customer: org.stripeId,
      id: invoiceId,
      subscription
    })
    stripe.__db.invoices[invoiceId].paid = false
    // TEST
    const sharedDataLoader = new DataLoaderWarehouse({
      ttl: 1000,
      onShare: '_share'
    })
    await stripeWebhookHandler(sharedDataLoader)(req, res)

    // VERIFY
    expect(res.sendStatus).toBeCalledWith(200)
    const db = await fetchAndSerialize(
      {
        invoice: r.table('Invoice').get(invoiceId),
        notification: r
          .table('Notification')
          .getAll(billingLeaderId, { index: 'userIds' })
          .orderBy('startAt')
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot()
  })
})
