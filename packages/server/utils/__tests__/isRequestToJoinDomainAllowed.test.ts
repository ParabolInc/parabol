/* eslint-env jest */
import {Insertable} from 'kysely'
import {r} from 'rethinkdb-ts'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import getRethinkConfig from '../../database/getRethinkConfig'
import getRethink from '../../database/rethinkDriver'
import {TierEnum} from '../../database/types/Invoice'
import OrganizationUser from '../../database/types/OrganizationUser'
import RootDataLoader from '../../dataloader/RootDataLoader'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {User} from '../../postgres/pg'
import getRedis from '../getRedis'
import {getEligibleOrgIdsByDomain} from '../isRequestToJoinDomainAllowed'

jest.mock('../../database/rethinkDriver')

jest.mocked(getRethink).mockImplementation(() => {
  return r as any
})

const TEST_DB = 'isRequestToJoinDomainAllowedTest'

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
  Pick<OrganizationUser, 'inactive' | 'joinedAt' | 'removedAt' | 'role' | 'userId'>
>

type TestUser = Insertable<User>
const addUsers = async (users: TestUser[]) => {
  getKysely().insertInto('User').values(users).execute()
}
const addOrg = async (
  activeDomain: string | null,
  members: TestOrganizationUser[],
  rest?: {featureFlags?: string[]; tier?: TierEnum}
) => {
  const {featureFlags, tier} = rest ?? {}
  const orgId = generateUID()
  const org = {
    id: orgId,
    activeDomain,
    featureFlags,
    name: 'foog',
    tier: tier ?? 'starter'
  }

  const orgUsers = members.map((member) => ({
    id: generateUID(),
    orgId,
    ...member,
    inactive: member.inactive ?? false,
    role: member.role ?? null,
    removedAt: member.removedAt ?? null
  }))
  await getKysely().insertInto('Organization').values(org).execute()
  await r.table('OrganizationUser').insert(orgUsers).run()
  return orgId
}

beforeAll(async () => {
  await r.connectPool(testConfig)
  const pg = getKysely(TEST_DB)
  try {
    await r.dbDrop(TEST_DB).run()
  } catch (e) {
    //ignore
  }
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await r.dbCreate(TEST_DB).run()
  await createPGTables('Organization', 'User', 'FreemailDomain')
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

test('Only the biggest org with verified emails qualify', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member1'
    }
  ])
  const biggerOrg = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder2',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member2'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder3',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])
  addUsers([
    {
      id: 'founder1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: 'user1',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder2',
      email: 'user2@parabol.co',
      picture: '',
      preferredName: 'user2',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder3',
      email: 'user3@parabol.co',
      picture: '',
      preferredName: 'user3',
      identities: [
        {
          isEmailVerified: false
        }
      ]
    }
  ])
  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([biggerOrg])
})

test('All the biggest orgs with verified emails qualify', async () => {
  const org1 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member1'
    }
  ])
  const org2 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder2',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member2'
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder3',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])
  await addUsers([
    {
      id: 'founder1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: 'user1',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder2',
      email: 'user2@parabol.co',
      picture: '',
      preferredName: 'user2',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder3',
      email: 'user3@parabol.co',
      picture: '',
      preferredName: 'user3',
      identities: [
        {
          isEmailVerified: false
        }
      ]
    }
  ])

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([org1, org2])
})

test('Team trumps starter tier with more users org', async () => {
  const teamOrg = await addOrg(
    'parabol.co',
    [
      {
        joinedAt: new Date('2023-09-06'),
        userId: 'founder1',
        role: 'BILLING_LEADER'
      },
      {
        joinedAt: new Date('2023-09-07'),
        userId: 'member1'
      }
    ],
    {tier: 'team'}
  )
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder2',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member2'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder3',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])

  await addUsers([
    {
      id: 'founder1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: 'user1',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder2',
      email: 'user2@parabol.co',
      picture: '',
      preferredName: 'user2',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder3',
      email: 'user3@parabol.co',
      picture: '',
      preferredName: 'user3',
      identities: [
        {
          isEmailVerified: false
        }
      ]
    }
  ])
  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([teamOrg])
})

test('Enterprise trumps team tier with more users org', async () => {
  const enterpriseOrg = await addOrg(
    'parabol.co',
    [
      {
        joinedAt: new Date('2023-09-06'),
        userId: 'founder1',
        role: 'BILLING_LEADER'
      },
      {
        joinedAt: new Date('2023-09-07'),
        userId: 'member1'
      }
    ],
    {tier: 'enterprise'}
  )
  await addOrg(
    'parabol.co',
    [
      {
        joinedAt: new Date('2023-09-06'),
        userId: 'founder2',
        role: 'BILLING_LEADER'
      },
      {
        joinedAt: new Date('2023-09-07'),
        userId: 'member2'
      },
      {
        joinedAt: new Date('2023-09-07'),
        userId: 'member3'
      }
    ],
    {tier: 'team'}
  )
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder3',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])

  await addUsers([
    {
      id: 'founder1',
      email: 'user1@parabol.co',
      picture: '',
      preferredName: 'user1',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder2',
      email: 'user2@parabol.co',
      picture: '',
      preferredName: 'user2',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'founder3',
      email: 'user3@parabol.co',
      picture: '',
      preferredName: 'user3',
      identities: [
        {
          isEmailVerified: false
        }
      ]
    }
  ])
  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([enterpriseOrg])
})

test('Orgs with verified emails from different domains do not qualify', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member1'
    }
  ])

  await addUsers([
    {
      id: 'founder1',
      email: 'user1@parabol.fun',
      picture: '',
      preferredName: 'user1',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    }
  ])

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([])
})

test('Orgs with at least 1 verified billing lead with correct email qualify', async () => {
  const org1 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'user1',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'user2',
      role: 'BILLING_LEADER'
    },
    {
      joinedAt: new Date('2023-09-08'),
      userId: 'user3',
      role: 'BILLING_LEADER'
    }
  ])

  await addUsers([
    {
      id: 'user1',
      email: 'user1@parabol.fun',
      preferredName: '',
      picture: '',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'user2',
      email: 'user2@parabol.fun',
      preferredName: '',
      picture: '',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'user3',
      email: 'user3@parabol.co',
      preferredName: '',
      picture: '',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    }
  ])

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([org1])
})
