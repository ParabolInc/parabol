import crypto from 'crypto'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {
  createOrgAdmin,
  getTestEmail,
  HOST,
  PROTOCOL,
  sendPublic,
  signUp,
  signUpWithEmail
} from './common'

const ORIGIN = `${PROTOCOL}://${HOST}`

const CLAUDE = {
  clientId: 'https://claude.ai/oauth/mcp-oauth-client-metadata',
  redirectUri: 'https://claude.ai/api/mcp/auth_callback'
}

const CREATE_OAUTH_API_CODE = `
  mutation CreateOAuthAPICode(
    $request: OAuthAuthorizationRequestInput!
    $grantedOrgIds: [ID!]
    $includePrivate: Boolean!
  ) {
    createOAuthAPICode(
      request: $request
      grantedOrgIds: $grantedOrgIds
      includePrivate: $includePrivate
    ) {
      redirectUri
    }
  }
`

const ORG_AI_APP_GRANTS = `
  query OrgAIAppGrants($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        aiAppGrants {
          id
          clientName
          clientHost
          clientVerifiedAt
          scopes
          createdAt
          user {
            id
          }
        }
      }
    }
  }
`

const ORG_GRANT_PRIVATE_FIELDS = `
  query OrgGrantPrivateFields($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        aiAppGrants {
          id
          grantedOrganizations {
            id
          }
          personalGrantedAt
        }
      }
    }
  }
`

const VIEWER_AI_APP_GRANTS = `
  query ViewerAIAppGrants {
    viewer {
      aiAppGrants {
        id
        clientName
        personalGrantedAt
        grantedOrganizations {
          id
        }
      }
    }
  }
`

const REVOKE_FROM_ORG = `
  mutation RevokeOAuthAPIGrantFromOrg($grantId: ID!, $orgId: ID!) {
    revokeOAuthAPIGrantFromOrg(grantId: $grantId, orgId: $orgId) {
      organization {
        id
      }
    }
  }
`

const DISCONNECT = `
  mutation DisconnectOAuthAPIGrant($grantId: ID!) {
    disconnectOAuthAPIGrant(grantId: $grantId) {
      user {
        id
      }
    }
  }
`

const ORG_NAME = `
  query OrgName($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        id
        name
      }
    }
  }
`

const VIEWER_ID = `
  query ViewerId {
    viewer {
      id
    }
  }
`

const CREATE_PAGE = `
  mutation CreatePage($teamId: ID) {
    createPage(teamId: $teamId) {
      page {
        id
      }
    }
  }
`

const PAGE = `
  query Page($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        id
      }
    }
  }
`

interface Choice {
  grantedOrgIds: string[] | null
  includePrivate?: boolean
}

const connect = async (cookie: string, {grantedOrgIds, includePrivate = false}: Choice) => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const request = {
    ...CLAUDE,
    scope: undefined,
    state: 'xyz',
    codeChallenge,
    codeChallengeMethod: 'S256'
  }
  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {request, grantedOrgIds, includePrivate},
    cookie
  })
  expect(approved.errors).toBeUndefined()
  const redirectUrl = new URL(approved.data.createOAuthAPICode.redirectUri)
  const response = await fetch(`${ORIGIN}/oauth/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: redirectUrl.searchParams.get('code')!,
      redirect_uri: CLAUDE.redirectUri,
      client_id: CLAUDE.clientId,
      code_verifier: codeVerifier
    })
  })
  expect(response.status).toBe(200)
  const {access_token} = await response.json()
  return access_token as string
}

const joinOrg = (orgId: string, userId: string) =>
  getKysely()
    .insertInto('OrganizationUser')
    .values({id: generateUID(), orgId, userId, role: null})
    .execute()

const getGrant = (userId: string) =>
  getKysely()
    .selectFrom('OAuthAPIGrant')
    .select(['id', 'grantedOrgIds', 'personalGrantedAt', 'revokedAt'])
    .where('userId', '=', userId)
    .where('clientId', '=', CLAUDE.clientId)
    .executeTakeFirstOrThrow()

const toClientId = (grantId: number) => CipherId.toClient(grantId, 'OAuthAPIGrant')

const createMember = async (
  orgId: string,
  choice: Choice | {grantedOrgIds: 'own'; includePrivate?: boolean}
) => {
  const {userId, cookie, orgId: ownOrgId} = await signUp()
  await joinOrg(orgId, userId)
  const token = await connect(cookie, {
    ...choice,
    grantedOrgIds: choice.grantedOrgIds === 'own' ? [ownOrgId] : choice.grantedOrgIds
  })
  return {userId, cookie, ownOrgId, token, grant: await getGrant(userId)}
}

test('an admin sees every member connection that reaches the org', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const allOrgs = await createMember(admin.orgId, {grantedOrgIds: null})
  const picked = await createMember(admin.orgId, {grantedOrgIds: [admin.orgId]})
  const elsewhere = await createMember(admin.orgId, {grantedOrgIds: 'own'})

  const res = await sendPublic({
    query: ORG_AI_APP_GRANTS,
    variables: {orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(res.errors).toBeUndefined()
  const grants = res.data.viewer.organization.aiAppGrants as {
    id: string
    clientName: string
    clientHost: string
    clientVerifiedAt: string | null
    scopes: string[]
    user: {id: string}
  }[]
  const ids = grants.map(({id}) => id)
  expect(ids).toContain(toClientId(allOrgs.grant.id))
  expect(ids).toContain(toClientId(picked.grant.id))
  expect(ids).not.toContain(toClientId(elsewhere.grant.id))
  const pickedGrant = grants.find(({id}) => id === toClientId(picked.grant.id))!
  expect(pickedGrant.clientHost).toBe('claude.ai')
  expect(pickedGrant.clientVerifiedAt).not.toBeNull()
  expect(pickedGrant.user.id).toBe(picked.userId)
  expect(pickedGrant.scopes.length).toBeGreaterThan(0)
})

test('an admin does not see connections of people who are not current members', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const stranger = await signUp()
  await connect(stranger.cookie, {grantedOrgIds: null})
  const former = await createMember(admin.orgId, {grantedOrgIds: null})
  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', admin.orgId)
    .where('userId', '=', former.userId)
    .execute()
  const strangerGrant = await getGrant(stranger.userId)

  const res = await sendPublic({
    query: ORG_AI_APP_GRANTS,
    variables: {orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(res.errors).toBeUndefined()
  const ids = res.data.viewer.organization.aiAppGrants.map(({id}: {id: string}) => id)
  expect(ids).not.toContain(toClientId(strangerGrant.id))
  expect(ids).not.toContain(toClientId(former.grant.id))
})

test('an admin API token cannot list connections', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const pat = await sendPublic({
    query: `
      mutation CreatePersonalAccessToken($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
        createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
          token
        }
      }
    `,
    variables: {
      name: 'grants',
      scopes: ['ORGS_READ'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie: admin.cookie
  })
  expect(pat.errors).toBeUndefined()
  const res = await sendPublic({
    query: ORG_AI_APP_GRANTS,
    variables: {orgId: admin.orgId},
    bearerToken: pat.data.createPersonalAccessToken.token
  })
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
})

test('an admin cannot see private-page access or other orgs on a connection', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {
    grantedOrgIds: [admin.orgId],
    includePrivate: true
  })

  const res = await sendPublic({
    query: ORG_GRANT_PRIVATE_FIELDS,
    variables: {orgId: admin.orgId},
    cookie: admin.cookie
  })
  const grant = res.data.viewer.organization.aiAppGrants.find(
    ({id}: {id: string}) => id === toClientId(member.grant.id)
  )
  expect(grant.personalGrantedAt).toBeNull()
  expect(grant.grantedOrganizations).toBeNull()
  expect(res.errors?.length).toBeGreaterThan(0)
  for (const error of res.errors!) expect(error.extensions.code).toBe('FORBIDDEN')
})

test("revoking an all-orgs connection keeps the member's other orgs", async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: null})

  const res = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(member.grant.id), orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.revokeOAuthAPIGrantFromOrg.organization.id).toBe(admin.orgId)
  const after = await getGrant(member.userId)
  expect(after.grantedOrgIds).toEqual([member.ownOrgId])
  expect(after.revokedAt).toBeNull()
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: member.token})
  expect(viewer.errors).toBeUndefined()
  const ownOrg = await sendPublic({
    query: ORG_NAME,
    variables: {orgId: member.ownOrgId},
    bearerToken: member.token
  })
  expect(ownOrg.errors).toBeUndefined()
  expect(ownOrg.data.viewer.organization.id).toBe(member.ownOrgId)
  const adminOrg = await sendPublic({
    query: ORG_NAME,
    variables: {orgId: admin.orgId},
    bearerToken: member.token
  })
  expect(adminOrg.data?.viewer?.organization ?? null).toBeNull()
  expect(adminOrg.errors?.length).toBeGreaterThan(0)
})

test("a disconnected connection can't be revoked from an org afterwards", async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: null})
  const disconnected = await sendPublic({
    query: DISCONNECT,
    variables: {grantId: toClientId(member.grant.id)},
    cookie: member.cookie
  })
  expect(disconnected.errors).toBeUndefined()
  const before = await getGrant(member.userId)
  expect(before.revokedAt).not.toBeNull()

  const res = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(member.grant.id), orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  const after = await getGrant(member.userId)
  expect(after.revokedAt).not.toBeNull()
  expect(after.grantedOrgIds).toEqual(before.grantedOrgIds)
})

test('an app token cannot read the grant list', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: null})
  const res = await sendPublic({query: VIEWER_AI_APP_GRANTS, bearerToken: member.token})
  expect(res.errors?.length).toBeGreaterThan(0)
  expect(res.errors![0]!.extensions.code).toBe('FORBIDDEN')
})

test('revoking the last org leaves a private-pages connection working', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {
    grantedOrgIds: [admin.orgId],
    includePrivate: true
  })
  const created = await sendPublic({query: CREATE_PAGE, cookie: member.cookie})
  expect(created.errors).toBeUndefined()
  const pageId = created.data.createPage.page.id as string

  const res = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(member.grant.id), orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(res.errors).toBeUndefined()
  const after = await getGrant(member.userId)
  expect(after.revokedAt).toBeNull()
  expect(after.grantedOrgIds).toEqual([])
  const page = await sendPublic({query: PAGE, variables: {pageId}, bearerToken: member.token})
  expect(page.errors).toBeUndefined()
  expect(page.data.public.page.id).toBe(pageId)
})

test('revoking the last org of a connection without private pages revokes it', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: [admin.orgId]})

  const res = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(member.grant.id), orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(res.errors).toBeUndefined()
  expect((await getGrant(member.userId)).revokedAt).not.toBeNull()
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: member.token})
  expect(viewer.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  const again = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(member.grant.id), orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(again.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  const unknown = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(2147483000), orgId: admin.orgId},
    cookie: admin.cookie
  })
  expect(unknown.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
})

test('a member who is not an admin cannot revoke', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: [admin.orgId]})

  const res = await sendPublic({
    query: REVOKE_FROM_ORG,
    variables: {grantId: toClientId(member.grant.id), orgId: admin.orgId},
    cookie: member.cookie
  })
  expect(res.data).toBeNull()
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect((await getGrant(member.userId)).grantedOrgIds).toEqual([admin.orgId])
})

test('a member sees their own connections and disconnects one everywhere', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: null, includePrivate: true})

  const list = await sendPublic({query: VIEWER_AI_APP_GRANTS, cookie: member.cookie})
  expect(list.errors).toBeUndefined()
  expect(list.data.viewer.aiAppGrants).toHaveLength(1)
  const [grant] = list.data.viewer.aiAppGrants
  expect(grant.id).toBe(toClientId(member.grant.id))
  expect(grant.personalGrantedAt).not.toBeNull()
  expect(grant.grantedOrganizations).toBeNull()

  const res = await sendPublic({
    query: DISCONNECT,
    variables: {grantId: grant.id},
    cookie: member.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.disconnectOAuthAPIGrant.user.id).toBe(member.userId)
  expect((await getGrant(member.userId)).revokedAt).not.toBeNull()
  const after = await sendPublic({query: VIEWER_AI_APP_GRANTS, cookie: member.cookie})
  expect(after.data.viewer.aiAppGrants).toEqual([])
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: member.token})
  expect(viewer.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})

test("nobody can disconnect someone else's connection", async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const member = await createMember(admin.orgId, {grantedOrgIds: [admin.orgId]})
  const stranger = await signUpWithEmail(getTestEmail())

  for (const {cookie} of [admin, stranger]) {
    const res = await sendPublic({
      query: DISCONNECT,
      variables: {grantId: toClientId(member.grant.id)},
      cookie
    })
    expect(res.data).toBeNull()
    expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  }
  expect((await getGrant(member.userId)).revokedAt).toBeNull()
})
