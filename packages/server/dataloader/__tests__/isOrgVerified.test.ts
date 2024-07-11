/* eslint-env jest */
import {Insertable} from 'kysely'
import {r} from 'rethinkdb-ts'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import getRethinkConfig from '../../database/getRethinkConfig'
import getRethink from '../../database/rethinkDriver'
import OrganizationUser from '../../database/types/OrganizationUser'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {User} from '../../postgres/pg'
import getRedis from '../../utils/getRedis'
import isUserVerified from '../../utils/isUserVerified'
import RootDataLoader from '../RootDataLoader'
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

type TestUser = Insertable<User>
const addUsers = async (users: TestUser[]) => {
  getKysely().insertInto('User').values(users).execute()
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

  return orgId
}

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
  await createPGTables('Organization', 'User', 'SAML', 'SAMLDomain')
  await createTables('OrganizationUser')
})

afterEach(async () => {
  await truncatePGTables('Organization', 'User')
  await r.table('OrganizationUser').delete().run()
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
  await addUsers([
    {
      id: 'user1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: '',
      identities: [{isEmailVerified: true}]
    }
  ])
  const dataLoader = new RootDataLoader()
  const isVerified = await dataLoader.get('isOrgVerified').load('parabol.co')
  expect(isVerified).toBe(true)
})

test('Non-founder billing lead is checked', async () => {
  await addUsers([
    {
      id: 'founder1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: '',
      identities: [{isEmailVerified: true}]
    },
    {
      id: 'billing1',
      email: 'billing1@parabol.co',
      picture: '',
      preferredName: '',
      identities: [{isEmailVerified: true}]
    }
  ])
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

  const dataLoader = new RootDataLoader()
  const isVerified = await dataLoader.get('isOrgVerified').load('parabol.co')
  expect(isVerified).toBe(true)
})

test('Empty org does not throw', async () => {
  await addOrg('parabol.co', [])

  const dataLoader = new RootDataLoader()
  const isVerified = await dataLoader.get('isOrgVerified').load('parabol.co')
  expect(isVerified).toBe(false)
})

test('Orgs with verified emails from different domains do not qualify', async () => {
  await addUsers([
    {
      id: 'founder1',
      email: 'user1@not-parabol.co',
      picture: '',
      preferredName: '',
      identities: [{isEmailVerified: true}]
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1',
      domain: 'not-parabol.co'
    } as any
  ])

  const dataLoader = new RootDataLoader()
  const isVerified = await dataLoader.get('isOrgVerified').load('parabol.co')
  expect(isVerified).toBe(false)
})
