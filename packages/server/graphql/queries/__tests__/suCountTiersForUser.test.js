/* eslint-env jest */
import mockAuthToken from '../../../__tests__/setup/mockAuthToken'
import MockDB from '../../../__tests__/setup/MockDB'
import expectAsyncToThrow from '../../../__tests__/utils/expectAsyncToThrow'
import suCountTiersForUser from '../suCountTiersForUser'
import { PRO } from 'parabol-client/utils/constants'

console.error = jest.fn()

test('return counts for a userId', async () => {
  // SETUP
  const mockDB = new MockDB()
  const { user } = await mockDB.init()
  const authToken = mockAuthToken(user[0], { rol: 'su' })
  // TEST
  const result = await suCountTiersForUser.resolve(undefined, { userId: user[0].id }, { authToken })

  // VERIFY
  expect(result.tierPersonalCount).toBeGreaterThanOrEqual(0)
  expect(result.tierProCount).toBeGreaterThanOrEqual(0)
  expect(result.tierProBillingLeaderCount).toBeGreaterThanOrEqual(0)
  expect(result.userId).toBe(user[0].id)
})

test('pro count increments on new Pro Org for userId', async () => {
  // SETUP
  const mockDB = new MockDB()
  await mockDB.init().newOrg({ name: 'Marvel', tier: PRO })
  const authToken = mockAuthToken(mockDB.context.user, { rol: 'su' })
  // TEST
  const result = await suCountTiersForUser.resolve(
    undefined,
    { userId: mockDB.context.user.id },
    { authToken }
  )

  // VERIFY
  expect(result.tierPersonalCount).toBeGreaterThanOrEqual(0)
  expect(result.tierProCount).toBeGreaterThanOrEqual(1)
  expect(result.tierProBillingLeaderCount).toBeGreaterThanOrEqual(1)
  expect(result.userId).toBe(mockDB.context.user.id)
})

test('user token requires su role', async () => {
  // SETUP
  const mockDB = new MockDB()
  const { user } = await mockDB.init()
  const authToken = mockAuthToken(user[0])

  // TEST & VERIFY
  await expectAsyncToThrow(
    suCountTiersForUser.resolve(undefined, { userId: user[0].id }, { authToken })
  )
})
