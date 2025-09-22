import type {Insertable} from 'kysely'
import '../../../../scripts/webpack/utils/dotenv'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import type {OrganizationUser} from '../../postgres/types'
import type {User} from '../../postgres/types/pg'
import getRedis from '../../utils/getRedis'
import {getNewDataLoader} from '../getNewDataLoader'

const TEST_DB = 'activeOrganizationUsersCustomLoaderTest'

type TestOrganizationUser = Partial<Pick<OrganizationUser, 'joinedAt' | 'removedAt' | 'userId'>> & {
  userId: string
}

type TestUser = Insertable<User>
const addUsers = async (users: TestUser[]) => {
  return getKysely().insertInto('User').values(users).execute()
}
const addOrg = async (members: TestOrganizationUser[]) => {
  const orgId = generateUID()
  const org = {
    id: orgId,
    name: 'foog'
  }

  const orgUsers = members.map((member) => ({
    id: generateUID(),
    orgId,
    ...member,
    removedAt: member.removedAt ?? null
  }))
  await getKysely()
    .with('Org', (qc) => qc.insertInto('Organization').values(org))
    .insertInto('OrganizationUser')
    .values(orgUsers)
    .execute()
  return orgId
}

beforeAll(async () => {
  const pg = getKysely(TEST_DB)
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('Organization', 'User', 'OrganizationUser')
})

afterEach(async () => {
  await truncatePGTables('Organization', 'User', 'OrganizationUser')
})

afterAll(async () => {
  const pg = getKysely()
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
  getRedis().quit()
})

test('Result is mapped to correct id', async () => {
  await addUsers([
    {
      id: 'u1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: 'user1'
    },
    {
      id: 'u2',
      email: 'user2@parabol.co',
      picture: '',
      preferredName: 'user2'
    },
    {
      id: 'u3',
      email: 'user3@parabol.co',
      picture: '',
      preferredName: 'user3'
    }
  ])
  const org1 = await addOrg([
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'u1'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'u2'
    }
  ])
  const org2 = await addOrg([
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'u3'
    }
  ])

  const dataloader = getNewDataLoader('test')

  const activeOrgUsers = await dataloader
    .get('activeOrganizationUsersByOrgId')
    .loadMany([org1, 'foo', org2])

  expect(activeOrgUsers).toEqual([
    [
      expect.objectContaining({
        userId: 'u1'
      }),
      expect.objectContaining({
        userId: 'u2'
      })
    ],
    [],
    [
      expect.objectContaining({
        userId: 'u3'
      })
    ]
  ])
})

test('Inactive users are ignored', async () => {
  await addUsers([
    {
      id: 'u1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: 'user1',
      inactive: true
    },
    {
      id: 'u2',
      email: 'user2@parabol.co',
      picture: '',
      preferredName: 'user2'
    },
    {
      id: 'u3',
      email: 'user3@parabol.co',
      picture: '',
      preferredName: 'user3',
      inactive: true
    }
  ])
  const org1 = await addOrg([
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'u1'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'u2'
    }
  ])
  const org2 = await addOrg([
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'u3'
    }
  ])

  const dataloader = getNewDataLoader('test')

  const activeOrgUsers = await dataloader
    .get('activeOrganizationUsersByOrgId')
    .loadMany([org1, org2])

  expect(activeOrgUsers).toEqual([
    [
      expect.objectContaining({
        userId: 'u2'
      })
    ],
    []
  ])
})
