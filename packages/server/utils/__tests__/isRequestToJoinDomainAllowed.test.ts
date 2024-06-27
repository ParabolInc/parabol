/* eslint-env jest */
import {r} from 'rethinkdb-ts'
import getRethinkConfig from '../../database/getRethinkConfig'
import getRethink from '../../database/rethinkDriver'
import {TierEnum} from '../../database/types/Invoice'
import OrganizationUser from '../../database/types/OrganizationUser'
import generateUID from '../../generateUID'
import {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
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
  await r.table('Organization').insert(org).run()
  await r.table('OrganizationUser').insert(orgUsers).run()
  return orgId
}

const userLoader = {
  load: jest.fn(),
  loadMany: jest.fn()
}
userLoader.loadMany.mockReturnValue([])

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

beforeAll(async () => {
  await r.connectPool(testConfig)
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
  await r.getPoolMaster()?.drain()
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

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1'])
})

test('Org with noPromptToJoinOrg feature flag is ignored', async () => {
  await addOrg(
    'parabol.co',
    [
      {
        joinedAt: new Date('2023-09-06'),
        role: 'BILLING_LEADER',
        userId: 'user1'
      },
      {
        joinedAt: new Date('2023-09-12'),
        userId: 'user2'
      }
    ],
    {featureFlags: ['noPromptToJoinOrg']}
  )

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
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
    },
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'member2'
    }
  ])

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  // implementation detail, important is only that no user was loaded
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith([])
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

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['billing1'])
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

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1'])
})

test('All matching orgs are checked', async () => {
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
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-12'),
      userId: 'founder2'
    },
    {
      joinedAt: new Date('2023-09-13'),
      userId: 'member2'
    }
  ])

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  // implementation detail, important is only that both users were loaded
  expect(userLoader.loadMany).toHaveBeenCalledTimes(2)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder2'])
})

test('Empty org does not throw', async () => {
  await addOrg('parabol.co', [])

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
})

test('No org does not throw', async () => {
  await getEligibleOrgIdsByDomain('example.com', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
})

test('1 person orgs are ignored', async () => {
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      role: 'BILLING_LEADER',
      userId: 'founder1'
    }
  ])

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
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

  await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(0)
})

test('Only the biggest org with verified emails qualify', async () => {
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
  const biggerOrg = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder2'
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
      userId: 'founder3'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])

  userLoader.loadMany.mockImplementation((userIds) => {
    const users = {
      founder1: {
        email: 'user1@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder2: {
        email: 'user2@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder3: {
        email: 'user3@parabol.co',
        identities: [
          {
            isEmailVerified: false
          }
        ]
      }
    }
    return userIds.map((id: keyof typeof users) => ({
      id,
      ...users[id]
    }))
  })

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(3)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder2'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder3'])
  expect(orgIds).toIncludeSameMembers([biggerOrg])
})

test('All the biggest orgs with verified emails qualify', async () => {
  const org1 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder1'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member1'
    }
  ])
  const org2 = await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder2'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member2'
    }
  ])
  await addOrg('parabol.co', [
    {
      joinedAt: new Date('2023-09-06'),
      userId: 'founder3'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])

  userLoader.loadMany.mockImplementation((userIds) => {
    const users = {
      founder1: {
        email: 'user1@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder2: {
        email: 'user2@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder3: {
        email: 'user3@parabol.co',
        identities: [
          {
            isEmailVerified: false
          }
        ]
      }
    }
    return userIds.map((id: keyof typeof users) => ({
      id,
      ...users[id]
    }))
  })

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(3)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder2'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder3'])
  expect(orgIds).toIncludeSameMembers([org1, org2])
})

test('Team trumps starter tier with more users org', async () => {
  const teamOrg = await addOrg(
    'parabol.co',
    [
      {
        joinedAt: new Date('2023-09-06'),
        userId: 'founder1'
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
      userId: 'founder2'
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
      userId: 'founder3'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])

  userLoader.loadMany.mockImplementation((userIds) => {
    const users = {
      founder1: {
        email: 'user1@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder2: {
        email: 'user2@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder3: {
        email: 'user3@parabol.co',
        identities: [
          {
            isEmailVerified: false
          }
        ]
      }
    }
    return userIds.map((id: keyof typeof users) => ({
      id,
      ...users[id]
    }))
  })

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(3)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder2'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder3'])
  expect(orgIds).toIncludeSameMembers([teamOrg])
})

test('Enterprise trumps team tier with more users org', async () => {
  const enterpriseOrg = await addOrg(
    'parabol.co',
    [
      {
        joinedAt: new Date('2023-09-06'),
        userId: 'founder1'
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
        userId: 'founder2'
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
      userId: 'founder3'
    },
    {
      joinedAt: new Date('2023-09-07'),
      userId: 'member3'
    }
  ])

  userLoader.loadMany.mockImplementation((userIds) => {
    const users = {
      founder1: {
        email: 'user1@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder2: {
        email: 'user2@parabol.co',
        identities: [
          {
            isEmailVerified: true
          }
        ]
      },
      founder3: {
        email: 'user3@parabol.co',
        identities: [
          {
            isEmailVerified: false
          }
        ]
      }
    }
    return userIds.map((id: keyof typeof users) => ({
      id,
      ...users[id]
    }))
  })

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(3)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder1'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder2'])
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder3'])
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

  userLoader.loadMany.mockReturnValue([
    {
      id: 'founder1',
      email: 'user1@parabol.fun',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    }
  ])

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['founder1'])
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

  userLoader.loadMany.mockReturnValue([
    {
      id: 'user1',
      email: 'user1@parabol.fun',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'user2',
      email: 'user2@parabol.fun',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    },
    {
      id: 'user3',
      email: 'user3@parabol.co',
      identities: [
        {
          isEmailVerified: true
        }
      ]
    }
  ])

  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(userLoader.loadMany).toHaveBeenCalledTimes(1)
  expect(userLoader.loadMany).toHaveBeenCalledWith(['user1', 'user2', 'user3'])
  expect(orgIds).toIncludeSameMembers([org1])
})
