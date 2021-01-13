/* eslint-env jest */
import mockAuthToken from '../../../__tests__/setup/mockAuthToken'
import MockDB from '../../../__tests__/setup/MockDB'
import expectAsyncToThrow from '../../../__tests__/utils/expectAsyncToThrow'
import suUserCount from '../suUserCount'
import { PERSONAL, PRO } from 'parabol-client/utils/constants'
import shortid from 'shortid'

console.error = jest.fn()

const defaultResolverArgs = {
  ignoreEmailRegex: '',
  includeInactive: false,
  tier: PRO
}

test('counts the number of Personal users', async () => {
  // SETUP
  const mockDB = new MockDB()
  const { user } = await mockDB.init()
  const authToken = mockAuthToken(user[1], { rol: 'su' })
  // TEST
  const initial = await suUserCount.resolve(
    undefined,
    {
      ...defaultResolverArgs,
      tier: PERSONAL
    },
    { authToken }
  )

  // VERIFY
  expect(initial >= 0).toBe(true)
})

test('counts the number of Pro users', async () => {
  // SETUP
  const mockDB = new MockDB()
  const { user } = await mockDB.init()
  const authToken = mockAuthToken(user[1], { rol: 'su' })
  // TEST
  const initial = await suUserCount.resolve(undefined, defaultResolverArgs, {
    authToken
  })

  // VERIFY
  expect(initial >= 0).toBe(true)
})

test('new Pro org increments number of Pro users', async () => {
  // SETUP
  const mockDB = new MockDB()
  const { user } = await mockDB.init()
  const authToken = mockAuthToken(user[1], { rol: 'su' })
  // TEST
  // Each newOrg will add one new billing leader:
  const initial = await suUserCount.resolve(undefined, defaultResolverArgs, {
    authToken
  })
  await mockDB
    .newOrg({ name: shortid.generate(), tier: PRO })
    .newOrg({ name: shortid.generate(), tier: PRO })
  const next = await suUserCount.resolve(undefined, defaultResolverArgs, {
    authToken
  })

  // VERIFY
  // Tests run concurrently, so anything that counts across the entire database must be atomic (no initial, then next)
  expect(next !== initial).toBe(true)
})

test('user token requires su role', async () => {
  // SETUP
  const mockDB = new MockDB()
  const { user } = await mockDB.init()
  const authToken = mockAuthToken(user[1])

  // TEST & VERIFY
  await expectAsyncToThrow(suUserCount.resolve(undefined, defaultResolverArgs, { authToken }))
})
