/* eslint-env jest */
import {MasterPool, r} from 'rethinkdb-ts'
import getRedis from '../getRedis'
import RedisLockQueue from '../RedisLockQueue'
import sleep from 'parabol-client/utils/sleep'
import getRethinkConfig from '../../database/getRethinkConfig'
import getRethink from '../../database/rethinkDriver'
import {getEligibleOrgIdsByDomain} from '../isRequestToJoinDomainAllowed'
import generateUID from '../../generateUID'
jest.mock('../../database/rethinkDriver')

getRethink.mockImplementation(() => {
  return r
})

const TEST_DB = 'isRequestToJoinDomainAllowedTest'

const config = getRethinkConfig()
const testConfig = {
  ...config,
  db: TEST_DB
}

const createTables = async (...tables: string) => {
  for (const tableName of tables) {
    const structure = await r
      .db('rethinkdb')
      .table('table_config')
      .filter({db: config.db, name: tableName})
      .run()
    await r.tableCreate(tableName).run()
    const {indexes} = structure[0]
    for (const index of indexes) {
      await r.table(tableName).indexCreate(index).run()
    }
    await r.table(tableName).indexWait().run()
  }
}

type TestOrganizationUser = Pick<
  OrganizationUser,
  'inactive' | 'joinedAt' | 'removedAt' | 'role' | 'userId'
>

const addOrg = async (activeDomain: string | null, members: TestOrganizationUser[]) => {
  const orgId = generateUID()
  const org = {
    id: orgId,
    activeDomain
  }

  const orgUsers = members.map((member) => ({
    id: generateUID(),
    orgId,
    ...member,
    inactive: member.inactive ?? false,
    role: member.role ?? null,
    removedAt: member.removedAt ?? null
  }))

  await r.table('Organization').insert(org).run()
  await r.table('OrganizationUser').insert(orgUsers).run()
  return orgId
}

const mockLoaders = () => {
  const userLoader = {
    load: jest.fn(),
    loadMany: jest.fn()
  }
  userLoader.loadMany.mockReturnValue([])
  const dataLoader = {
    get: jest.fn((loader) => (loader === 'users' ? userLoader : null))
  }
  return {userLoader, dataLoader}
}

beforeAll(async () => {
  const conn = await r.connectPool(testConfig)
  try {
    await r.dbDrop(TEST_DB).run()
  } catch (e) {
    //ignore
  }
  await r.dbCreate(TEST_DB).run()
  await createTables('Organization', 'OrganizationUser')
})

afterEach(async () => {
  await r.table('Organization').delete().run()
  await r.table('OrganizationUser').delete().run()
})

afterAll(async () => {
  await r.getPoolMaster().drain()
  getRedis().quit()
})

test('Founder is billing lead', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'user1'
    },
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'user2'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1'])
})

test('Inactive founder is ignored', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'user1',
      inactive: true
    },
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'user2'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  // implementation detail, important is only that no user was loaded
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith([])
})

test('Non-founder billing lead is checked', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'user1',
      inactive: true
    },
    {
      joinedAt: new Date('2023-09-12'),
      role: 'BILLING_LEADER',
      userId: 'user2'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user2'])
})

test('Founder is checked even when not billing lead', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user1'
    },
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'user2'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1'])
})

test('All matching orgs are checked', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user1'
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'user2'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  // implementation detail, important is only that both users were loaded
  expect(userLoader.loadMany).toHaveBeenCalledTimes(2)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user2'])
})

test('Empty org does not throw', async () => {
  await addOrg('parabol.co', [])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
})

test('No org does not throw', async () => {
  const {userLoader, dataLoader} = mockLoaders()
  const orgIds = await getEligibleOrgIdsByDomain('example.com', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
})

test('Org matching the user are ignored', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user1'
    },
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'newUser'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
})

test('All orgs with verified emails qualify', async () => {
  const org1 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user1'
    }
  ])
  const org2 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user2'
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user3'
    }
  ])
  const {userLoader, dataLoader} = mockLoaders()

  userLoader.loadMany.mockReturnValueOnce([
    {
      id: 'user1',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    }
  ])
  userLoader.loadMany.mockReturnValueOnce([
    {
      id: 'user2',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    }
  ])
  userLoader.loadMany.mockReturnValueOnce([
    {
      id: 'user3',
      identities: [
        {
          isEmailVerified: false
        }
      ]
    }
  ])
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(3)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user2'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user3'])
  expect(orgIds).toIncludeSameMembers([org1, org2])
})
