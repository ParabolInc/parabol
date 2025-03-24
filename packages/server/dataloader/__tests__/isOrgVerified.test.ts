/* eslint-env jest */
import {Insertable} from 'kysely'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {OrganizationUser} from '../../postgres/types'
import {User} from '../../postgres/types/pg'
import RootDataLoader from '../RootDataLoader'

const TEST_DB = 'getVerifiedOrgIdsTest'

type TestUser = Insertable<User>
const addUsers = async (users: TestUser[]) => {
  return getKysely().insertInto('User').values(users).execute()
}

type TestOrganizationUser = Partial<
  Pick<OrganizationUser, 'inactive' | 'joinedAt' | 'removedAt' | 'role' | 'userId'>
>

const addOrg = async (activeDomain: string | null, members: TestOrganizationUser[]) => {
  const orgId = activeDomain!
  const org = {
    id: orgId,
    activeDomain,
    name: 'baddadan'
  }

  const orgUsers = members.map((member) => ({
    id: generateUID(),
    userId: generateUID(),
    orgId,
    ...member,
    inactive: member.inactive ?? false,
    role: member.role ?? null,
    removedAt: member.removedAt ?? null,
    tier: 'starter' as const
  }))

  const pg = getKysely()
  if (orgUsers.length > 0) {
    await pg
      .with('Org', (qc) => qc.insertInto('Organization').values(org))
      .insertInto('OrganizationUser')
      .values(orgUsers)
      .execute()
  } else {
    await pg.insertInto('Organization').values(org).execute()
  }

  return orgId
}

beforeAll(async () => {
  const pg = getKysely(TEST_DB)
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('Organization', 'User', 'SAML', 'SAMLDomain', 'OrganizationUser')
})

afterEach(async () => {
  await truncatePGTables('Organization', 'User', 'OrganizationUser')
})

afterAll(async () => {
  const pg = getKysely()
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
  console.log('org verified destroy')
})

test('Founder is billing lead', async () => {
  await addUsers([
    {
      id: 'user1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: '',
      identities: [{isEmailVerified: true}]
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'user1'
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
    },
    {
      id: 'member1',
      email: 'member1@parabol.co',
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
      userId: 'founder1'
    } as any
  ])

  const dataLoader = new RootDataLoader()
  const isVerified = await dataLoader.get('isOrgVerified').load('parabol.co')
  expect(isVerified).toBe(false)
})
