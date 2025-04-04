/* eslint-env jest */
import {Insertable} from 'kysely'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import RootDataLoader from '../../dataloader/RootDataLoader'
import generateUID from '../../generateUID'
import {TierEnum} from '../../graphql/public/resolverTypes'
import getKysely from '../../postgres/getKysely'
import {OrganizationUser} from '../../postgres/types'
import {User} from '../../postgres/types/pg'
import getRedis from '../getRedis'
import {getEligibleOrgIdsByDomain} from '../isRequestToJoinDomainAllowed'

const TEST_DB = 'isRequestToJoinDomainAllowedTest'

type TestOrganizationUser = Partial<
  Pick<OrganizationUser, 'inactive' | 'joinedAt' | 'removedAt' | 'role' | 'userId'>
> & {userId: string}

type TestUser = Insertable<User>
const addUsers = async (users: TestUser[]) => {
  return getKysely().insertInto('User').values(users).execute()
}
const addOrg = async (
  activeDomain: string | null,
  members: TestOrganizationUser[],
  rest?: {tier?: TierEnum}
) => {
  const {tier} = rest ?? {}
  const orgId = generateUID()
  const org = {
    id: orgId,
    activeDomain,
    name: 'foog',
    tier: tier ?? 'starter'
  }

  const orgUsers = members.map((member) => ({
    id: generateUID(),
    orgId,
    ...member,
    inactive: member.inactive ?? false,
    role: member.role ?? null,
    removedAt: member.removedAt ?? null,
    tier: 'starter' as const
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
  await createPGTables(
    'Organization',
    'User',
    'FreemailDomain',
    'SAML',
    'SAMLDomain',
    'OrganizationUser'
  )
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

test('Only the biggest org with verified emails qualify', async () => {
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
    },
    {
      id: 'member1',
      email: 'member1@parabol.co',
      picture: '',
      preferredName: ''
    },
    {
      id: 'member2',
      email: 'member2@parabol.co',
      picture: '',
      preferredName: ''
    },
    {
      id: 'member3',
      email: 'member3@parabol.co',
      picture: '',
      preferredName: ''
    }
  ])
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
  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([biggerOrg])
})

test('All the biggest orgs with verified emails qualify', async () => {
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

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([org1, org2])
})

test('Team trumps starter tier with more users org', async () => {
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

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([teamOrg])
})

test('Enterprise trumps team tier with more users org', async () => {
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

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([enterpriseOrg])
})

test('Orgs with verified emails from different domains do not qualify', async () => {
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

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([])
})

test('Orgs with at least 1 verified billing lead with correct email qualify', async () => {
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

  const dataLoader = new RootDataLoader()
  const orgIds = await getEligibleOrgIdsByDomain('parabol.co', 'newUser', dataLoader)
  expect(orgIds).toIncludeSameMembers([org1])
})
