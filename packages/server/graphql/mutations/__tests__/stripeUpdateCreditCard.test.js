/* eslint-env jest */
import DynamicSerializer from 'dynamic-serializer'
import MockRes from '../../../__mocks__/MockRes'
import MockDB from '../../../__tests__/setup/MockDB'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import stripe from '../../../billing/stripe'
import stripeWebhookHandler from '../../../billing/stripeWebhookHandler'
import DataLoaderWarehouse from 'dataloader-warehouse'
import getRethink from '../../../database/rethinkDriver'
import customerSourceUpdatedEvent from './mockStripeEvents/customerSourceUpdatedEvent'
import shortid from 'shortid'
import { PRO } from 'parabol-client/utils/constants'
import MockReq from '../../../__mocks__/MockReq'

console.error = jest.fn()

describe('stripeUpdateCreditCard', () => {
  test('handles customer.sources.updated', async () => {
    // SETUP
    const invoiceId = `in_${shortid.generate()}`

    const res = new MockRes()
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { organization } = await mockDB.init({ plan: PRO })
    const org = organization[0]
    const req = new MockReq({ body: customerSourceUpdatedEvent(org.stripeId) })
    stripe.__setMockData(org)
    const subscription = stripe.__db.subscriptions[org.stripeSubscriptionId]
    await stripe.invoices.create({
      customer: org.stripeId,
      id: invoiceId,
      subscription
    })

    // mutate stripe DB so it doesn't match our own DB (they know something we don't)
    const oldCCs = stripe.__db.customers[org.stripeId].sources.data
    oldCCs[0] = {
      ...oldCCs[0],
      last4: req.body.data.object.last4,
      exp_month: req.body.data.object.exp_month,
      exp_year: req.body.data.object.exp_year,
      brand: req.body.data.object.brand
    }

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
        organization: r.table('Organization').get(org.id)
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
  })
})
