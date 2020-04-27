/* eslint-env jest */
import DynamicSerializer from 'dynamic-serializer'
import MockDB from '../../../__tests__/setup/MockDB'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import stripe from '../../../billing/stripe'
import stripeWebhookHandler from '../../../billing/stripeWebhookHandler'
import DataLoaderWarehouse from 'dataloader-warehouse'
import getRethink from '../../../database/rethinkDriver'
import invoicePaymentSucceededEvent from './mockStripeEvents/invoicePaymentSucceededEvent'
import shortid from 'shortid'
import { PRO } from 'parabol-client/utils/constants'
import MockRes from '../../../__mocks__/MockRes'
import MockReq from '../../../__mocks__/MockReq'

console.error = jest.fn()

describe('stripeSucceedPayment', () => {
  test('handles invoice.payment_succeeded', async () => {
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
      body: invoicePaymentSucceededEvent(invoiceId, org.stripeId, org.stripeSubscriptionId)
    })
    const subscription = stripe.__db.subscriptions[org.stripeSubscriptionId]
    await stripe.invoices.create({
      customer: org.stripeId,
      id: invoiceId,
      subscription
    })

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
        invoice: r.table('Invoice').get(invoiceId)
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
  })
})
