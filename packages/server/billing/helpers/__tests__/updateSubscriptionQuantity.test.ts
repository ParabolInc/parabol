import {createPGTables, truncatePGTables} from '../../../__tests__/common'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import getRedis from '../../../utils/getRedis'
import logError from '../../../utils/logError'
import updateSubscriptionQuantity from '../updateSubscriptionQuantity'

const TEST_DB = 'updateSubscriptionQuantityTest'
const SUBSCRIPTION_ITEM_ID = 'si_test'

const mockStripeManager = {
  getSubscriptionItem: jest.fn(),
  updateSubscriptionItemQuantity: jest.fn()
}
jest.mock('../../../utils/stripe', () => ({getStripeManager: () => mockStripeManager}))
jest.mock('../../../utils/logError')

const addOrgWithMembers = async (members: {inactive?: boolean; removed?: boolean}[]) => {
  const orgId = generateUID()
  const users = members.map(({inactive}) => {
    const id = generateUID()
    return {id, email: `${id}@example.com`, picture: '', preferredName: id, inactive: !!inactive}
  })
  const pg = getKysely()
  await pg.insertInto('User').values(users).execute()
  await pg
    .insertInto('Organization')
    .values({id: orgId, name: 'org', tier: 'team', stripeSubscriptionId: 'sub_test'})
    .execute()
  await pg
    .insertInto('OrganizationUser')
    .values(
      members.map(({removed}, idx) => ({
        id: generateUID(),
        orgId,
        userId: users[idx]!.id,
        removedAt: removed ? new Date() : null
      }))
    )
    .execute()
  return orgId
}

const billSubscriptionFor = (quantity: number) => {
  mockStripeManager.getSubscriptionItem.mockResolvedValue({id: SUBSCRIPTION_ITEM_ID, quantity})
}

beforeAll(async () => {
  const pg = getKysely(TEST_DB)
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('Organization', 'User', 'OrganizationUser', 'StripeQuantityMismatchLogging')
})

afterEach(async () => {
  await truncatePGTables(
    'Organization',
    'User',
    'OrganizationUser',
    'StripeQuantityMismatchLogging'
  )
})

afterAll(async () => {
  const pg = getKysely()
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
  getRedis().quit()
})

test('a subscription billed for every active member is left as it is', async () => {
  const orgId = await addOrgWithMembers([{}, {}, {inactive: true}, {removed: true}])
  billSubscriptionFor(2)
  await updateSubscriptionQuantity(orgId, true)
  expect(mockStripeManager.updateSubscriptionItemQuantity).not.toHaveBeenCalled()
  expect(logError).not.toHaveBeenCalled()
})

test('a subscription billed for the wrong number of members is set to the active members', async () => {
  const orgId = await addOrgWithMembers([{}, {}, {inactive: true}, {removed: true}])
  billSubscriptionFor(4)
  await updateSubscriptionQuantity(orgId, true)
  expect(mockStripeManager.updateSubscriptionItemQuantity).toHaveBeenCalledWith(
    SUBSCRIPTION_ITEM_ID,
    2
  )
  expect(logError).toHaveBeenCalledTimes(1)
})
