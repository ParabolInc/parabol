/* eslint-env jest */
import {MasterPool, r} from 'rethinkdb-ts'
import getRedis from '../../utils/getRedis'
import getRethinkConfig from '../../database/getRethinkConfig'
import getRethink from '../../database/rethinkDriver'
import isUserVerified from '../../utils/isUserVerified'
import generateUID from '../../generateUID'
import {getVerifiedOrgIds} from '../customLoaderMakers'
jest.mock('../../database/rethinkDriver')
jest.mock('../../utils/isUserVerified')

getRethink.mockImplementation(() => {
  return r
})
isUserVerified.mockImplementation(() => {
  return true
})

const TEST_DB = 'getVerifiedOrgIdsTest'

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

const userLoader = {
  load: jest.fn(),
  loadMany: jest.fn()
}
const isCompanyDomainLoader = {
  load: jest.fn(),
  loadMany: jest.fn()
}
isCompanyDomainLoader.load.mockReturnValue(true)

const dataLoader = {
  get: jest.fn((loader) => {
    const loaders = {
      users: userLoader,
      isCompanyDomain: isCompanyDomainLoader
    }
    return loaders[loader]
  })
}

const addOrg = async (
  activeDomain: string | null,
  members: TestOrganizationUser[],
  featureFlags?: string[]
) => {
  const orgId = activeDomain
  const org = {
    id: orgId,
    activeDomain,
    featureFlags: featureFlags ?? []
  }

  const orgUsers = members.map((member) => ({
    id: generateUID(),
    userId: generateUID(),
    orgId,
    ...member,
    inactive: member.inactive ?? false,
    role: member.role ?? null,
    removedAt: member.removedAt ?? null
  }))

  await r.table('Organization').insert(org).run()
  await r.table('OrganizationUser').insert(orgUsers).run()

  const users = orgUsers.map(({userId, domain}) => ({
    id: userId,
    domain: domain ?? activeDomain
  }))

  userLoader.load.mockImplementation((userId) => users.find((u) => u.id === userId))
  userLoader.loadMany.mockImplementation((userIds) => userIds.map(userLoader.load))

  return orgId
}

const getVerifiedOrgIdsLoader = getVerifiedOrgIds(dataLoader)

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
  getVerifiedOrgIdsLoader.clearAll()
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
    }
  ])

  const orgIds = await getVerifiedOrgIdsLoader.load('parabol.co')
  expect(orgIds).toIncludeSameMembers(['parabol.co'])
})

test('Inactive founder is ignored', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'founder1',
      inactive: true
    },
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'member1'
    }
  ])

  const orgIds = await getVerifiedOrgIdsLoader.load('parabol.co')
  expect(orgIds).toIncludeSameMembers([])
})

test('Non-founder billing lead is checked', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'founder1',
      inactive: true
    },
    {
      joinedAt: new Date('2023-09-12'),
      role: 'BILLING_LEADER',
      userId: 'billing1'
    },
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'member1'
    }
  ])

  const orgIds = await getVerifiedOrgIdsLoader.load('parabol.co')
  expect(orgIds).toIncludeSameMembers(['parabol.co'])
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

  const orgIds = await getVerifiedOrgIdsLoader.load('parabol.co')
  expect(orgIds).toIncludeSameMembers(['parabol.co'])
})

test('Empty org does not throw', async () => {
  await addOrg('parabol.co', [])

  const orgIds = await getVerifiedOrgIdsLoader.load('parabol.co')
  expect(orgIds).toIncludeSameMembers([])
})

test('Orgs with verified emails from different domains do not qualify', async () => {
  const org1 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1',
      domain: 'not-parabol.co'
    }
  ])

  const orgIds = await getVerifiedOrgIdsLoader.load('parabol.co')
  expect(orgIds).toIncludeSameMembers([])
})
