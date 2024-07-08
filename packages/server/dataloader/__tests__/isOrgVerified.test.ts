/* eslint-env jest */
import {sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import {createPGTables} from '../../__tests__/common'
import getRethinkConfig from '../../database/getRethinkConfig'
import getRethink from '../../database/rethinkDriver'
import OrganizationUser from '../../database/types/OrganizationUser'
import generateUID from '../../generateUID'
import {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
import getRedis from '../../utils/getRedis'
import isUserVerified from '../../utils/isUserVerified'
import RootDataLoader from '../RootDataLoader'
import {isOrgVerified} from '../customLoaderMakers'
jest.mock('../../database/rethinkDriver')
jest.mock('../../utils/isUserVerified')

jest.mocked(getRethink).mockImplementation(() => {
  return r as any
})

jest.mocked(isUserVerified).mockImplementation(() => {
  return true
})

const TEST_DB = 'getVerifiedOrgIdsTest'

const config = getRethinkConfig()
const testConfig = {
  ...config,
  db: TEST_DB
}

const createTables = async (...tables: string[]) => {
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

type TestOrganizationUser = Partial<
  Pick<OrganizationUser, 'inactive' | 'joinedAt' | 'removedAt' | 'role' | 'userId'> & {
    domain: string
  }
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
    return loaders[loader as keyof typeof loaders]
  })
} as any as DataLoaderWorker

const addOrg = async (
  activeDomain: string | null,
  members: TestOrganizationUser[],
  featureFlags?: string[]
) => {
  const orgId = activeDomain!
  const org = {
    id: orgId,
    activeDomain,
    name: 'baddadan',
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

  const pg = getKysely()
  await pg.insertInto('Organization').values(org).execute()
  await r.table('OrganizationUser').insert(orgUsers).run()

  const users = orgUsers.map(({userId, domain}) => ({
    id: userId,
    domain: domain ?? activeDomain
  }))

  userLoader.load.mockImplementation((userId) => users.find((u) => u.id === userId))
  userLoader.loadMany.mockImplementation((userIds) => userIds.map(userLoader.load))

  return orgId
}

const isOrgVerifiedLoader = isOrgVerified(dataLoader as any as RootDataLoader)

beforeAll(async () => {
  await r.connectPool(testConfig)
  const pg = getKysely()

  try {
    await r.dbDrop(TEST_DB).run()
  } catch (e) {
    //ignore
  }
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()

  await r.dbCreate(TEST_DB).run()
  await createPGTables('Organization')
  await createTables('OrganizationUser')
})

afterEach(async () => {
  const pg = getKysely()
  await sql`truncate table ${sql.table('Organization')}`.execute(pg)
  await r.table('OrganizationUser').delete().run()
  isOrgVerifiedLoader.clearAll()
})

afterAll(async () => {
  await r.getPoolMaster()?.drain()
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

  const isVerified = await isOrgVerifiedLoader.load('parabol.co')
  expect(isVerified).toBe(true)
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

  const isVerified = await isOrgVerifiedLoader.load('parabol.co')
  expect(isVerified).toBe(false)
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

  const isVerified = await isOrgVerifiedLoader.load('parabol.co')
  expect(isVerified).toBe(true)
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

  const isVerified = await isOrgVerifiedLoader.load('parabol.co')
  expect(isVerified).toBe(true)
})

test('Empty org does not throw', async () => {
  await addOrg('parabol.co', [])

  const isVerified = await isOrgVerifiedLoader.load('parabol.co')
  expect(isVerified).toBe(false)
})

test('Orgs with verified emails from different domains do not qualify', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1',
      domain: 'not-parabol.co'
    } as any
  ])

  const isVerified = await isOrgVerifiedLoader.load('parabol.co')
  expect(isVerified).toBe(false)
})
