/* eslint-env jest */
import DynamicSerializer from 'dynamic-serializer'
import MockDate from 'mockdate'
import makeDataLoader from '../../../__tests__/setup/makeDataLoader'
import mockAuthToken from '../../../__tests__/setup/mockAuthToken'
import MockDB from '../../../__tests__/setup/MockDB'
import { __now } from '../../../__tests__/setup/mockTimes'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import getRethink from '../../../database/rethinkDriver'
import { PRO } from 'parabol-client/utils/constants'
import updateCreditCard from '../updateCreditCard'
import stripe from '../../../billing/stripe'

MockDate.set(__now)
console.error = jest.fn()

describe('UpdateCreditCard', () => {
  test('can call updateCreditCard without a stripe subscription', async () => {
    // SETUP
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { organization, user } = await mockDB
      .init({ plan: PRO })
      .organization(0, { stripeSubscriptionId: null })
    const org = organization[0]
    const { id: orgId } = org
    stripe.__setMockData(org)
    const authToken = mockAuthToken(user[0])
    const dataLoader = makeDataLoader(authToken)

    // TEST
    await updateCreditCard.resolve(
      undefined,
      { orgId, stripeToken: 'tok_4242424242424242' },
      { authToken, dataLoader }
    )

    // VERIFY
    const db = await fetchAndSerialize(
      {
        organization: r.table('Organization').get(orgId),
        team: r.table('Team').getAll(orgId, { index: 'orgId' })
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot()
  })
})
