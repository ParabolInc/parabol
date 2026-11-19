import crypto from 'crypto'
import generateUID from '../generateUID'
import aiAppScopes from '../oauth2/aiAppScopes'
import isAIAppAllowedByOrg from '../oauth2/isAIAppAllowedByOrg'
import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {createOrgAdmin, getTestEmail, HOST, PROTOCOL, sendPublic, signUp} from './common'

const ORIGIN = `${PROTOCOL}://${HOST}`

interface Client {
  clientId: string
  redirectUri: string
}

const CLAUDE: Client = {
  clientId: 'https://claude.ai/oauth/mcp-oauth-client-metadata',
  redirectUri: 'https://claude.ai/api/mcp/auth_callback'
}

const NOT_ALLOWED_MESSAGE = 'None of the organizations this app was connected to allow it anymore'

const CREATE_OAUTH_API_CODE = `
  mutation CreateOAuthAPICode($request: OAuthAuthorizationRequestInput!) {
    createOAuthAPICode(request: $request) {
      redirectUri
    }
  }
`

const DELETE_OAUTH_API_PROVIDER = `
  mutation DeleteOAuthAPIProvider($providerId: ID!) {
    deleteOAuthAPIProvider(providerId: $providerId) {
      __typename
    }
  }
`

const UPDATE_ORG_AI_APPS_POLICY = `
  mutation UpdateOrgAIAppsPolicy($orgId: ID!, $policy: OrgAIAppsPolicyEnum!) {
    updateOrgAIAppsPolicy(orgId: $orgId, policy: $policy) {
      organization {
        id
        aiAppsPolicy
      }
    }
  }
`

const ORG_AI_APPS_POLICY = `
  query OrgAIAppsPolicy($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        aiAppsPolicy
      }
    }
  }
`

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const ADD_ORG = `
  mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      team {
        id
        orgId
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

const VIEWER_TEAMS = `
  query ViewerTeams {
    viewer {
      teams {
        id
      }
    }
  }
`

const connect = async (client: Client, cookie: string, scope?: string) => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const request = {...client, scope, state: 'xyz', codeChallenge, codeChallengeMethod: 'S256'}
  const approved = await sendPublic({query: CREATE_OAUTH_API_CODE, variables: {request}, cookie})
  expect(approved.errors).toBeUndefined()
  const redirectUrl = new URL(approved.data.createOAuthAPICode.redirectUri)
  const response = await fetch(`${ORIGIN}/oauth/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: redirectUrl.searchParams.get('code')!,
      redirect_uri: client.redirectUri,
      client_id: client.clientId,
      code_verifier: codeVerifier
    })
  })
  expect(response.status).toBe(200)
  const {access_token} = await response.json()
  return access_token as string
}

const createUnverifiedGlobalClient = async (): Promise<Client> => {
  const clientId = `global-test-${generateUID()}`
  const redirectUri = 'https://app.example.com/callback'
  await getKysely()
    .insertInto('OAuthAPIProvider')
    .values({
      clientId,
      name: 'Unverified global app',
      clientType: 'public',
      clientSecret: null,
      orgId: null,
      redirectUris: [redirectUri],
      scopes: aiAppScopes,
      verifiedAt: null
    })
    .execute()
  return {clientId, redirectUri}
}

const setPolicy = (orgId: string, policy: 'ALL' | 'VERIFIED' | 'NONE', cookie: string) =>
  sendPublic({query: UPDATE_ORG_AI_APPS_POLICY, variables: {orgId, policy}, cookie})

const withoutPrivatePages = (userId: string, clientId: string) =>
  getKysely()
    .updateTable('OAuthAPIGrant')
    .set({personalGrantedAt: null})
    .where('clientId', '=', clientId)
    .where('userId', '=', userId)
    .execute()

const expectNotAllowed = (response: {data: unknown; errors?: unknown[]}) => {
  expect(response.errors?.[0]).toMatchObject({
    message: NOT_ALLOWED_MESSAGE,
    extensions: {code: 'FORBIDDEN'}
  })
}

test('isAIAppAllowedByOrg follows useAI until a policy is set', () => {
  const verified = {verifiedAt: new Date()}
  const unverified = {verifiedAt: null}
  expect(isAIAppAllowedByOrg({aiAppsPolicy: null, useAI: true}, unverified)).toBe(true)
  expect(isAIAppAllowedByOrg({aiAppsPolicy: null, useAI: false}, verified)).toBe(false)
  expect(isAIAppAllowedByOrg({aiAppsPolicy: 'verified', useAI: false}, unverified)).toBe(false)
  expect(isAIAppAllowedByOrg({aiAppsPolicy: 'verified', useAI: false}, verified)).toBe(true)
  expect(isAIAppAllowedByOrg({aiAppsPolicy: 'all', useAI: false}, unverified)).toBe(true)
  expect(isAIAppAllowedByOrg({aiAppsPolicy: 'none', useAI: true}, verified)).toBe(false)
})

test('choosing No apps stops a live Claude token at the next request', async () => {
  const {userId, cookie, orgId} = await createOrgAdmin(getTestEmail())
  const token = await connect(CLAUDE, cookie)
  await withoutPrivatePages(userId, CLAUDE.clientId)
  const before = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(before.errors).toBeUndefined()

  const updated = await setPolicy(orgId, 'NONE', cookie)
  expect(updated.errors).toBeUndefined()
  expect(updated.data.updateOrgAIAppsPolicy.organization.aiAppsPolicy).toBe('NONE')
  expectNotAllowed(await sendPublic({query: VIEWER_ID, bearerToken: token}))

  await setPolicy(orgId, 'ALL', cookie)
  const after = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(after.errors).toBeUndefined()
})

test('turning off AI features blocks the app while no policy is set', async () => {
  const {userId, cookie, orgId} = await createOrgAdmin(getTestEmail())
  const token = await connect(CLAUDE, cookie)
  await withoutPrivatePages(userId, CLAUDE.clientId)
  await getKysely()
    .updateTable('Organization')
    .set({useAI: false})
    .where('id', '=', orgId)
    .execute()
  expectNotAllowed(await sendPublic({query: VIEWER_ID, bearerToken: token}))
  await setPolicy(orgId, 'ALL', cookie)
  const allowed = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(allowed.errors).toBeUndefined()
})

test('a connection with private pages still reaches them after every org blocks the app', async () => {
  const {userId, cookie, orgId} = await createOrgAdmin(getTestEmail())
  const token = await connect(CLAUDE, cookie)
  await setPolicy(orgId, 'NONE', cookie)
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(viewer.errors).toBeUndefined()
  expect(viewer.data.viewer.id).toBe(userId)
})

test('Verified apps blocks a CIMD client but not Claude', async () => {
  const {userId, cookie, orgId} = await createOrgAdmin(getTestEmail())
  const unverified = await createUnverifiedGlobalClient()
  const claudeToken = await connect(CLAUDE, cookie)
  const unverifiedToken = await connect(unverified, cookie)
  await withoutPrivatePages(userId, CLAUDE.clientId)
  await withoutPrivatePages(userId, unverified.clientId)

  await setPolicy(orgId, 'VERIFIED', cookie)
  const claude = await sendPublic({query: VIEWER_ID, bearerToken: claudeToken})
  expect(claude.errors).toBeUndefined()
  expectNotAllowed(await sendPublic({query: VIEWER_ID, bearerToken: unverifiedToken}))
})

test('a member who leaves an org loses it from the connection immediately', async () => {
  const {userId, cookie} = await createOrgAdmin(getTestEmail())
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  expect(added.errors).toBeUndefined()
  const otherTeamId = added.data.addOrg.team.id as string
  const otherOrgId = added.data.addOrg.team.orgId as string
  const token = await connect(CLAUDE, cookie)

  const before = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
  expect(before.data.viewer.teams.map(({id}: {id: string}) => id)).toContain(otherTeamId)

  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', otherOrgId)
    .where('userId', '=', userId)
    .execute()
  const after = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
  expect(after.errors).toBeUndefined()
  const teamIds = after.data.viewer.teams.map(({id}: {id: string}) => id)
  expect(teamIds).not.toContain(otherTeamId)
  expect(teamIds.length).toBeGreaterThan(0)
})

test('apps an org registers itself ignore the policy', async () => {
  const {userId, cookie, orgId} = await createOrgAdmin(getTestEmail())
  const clientId = `org-test-${generateUID()}`
  const redirectUri = 'https://app.example.com/callback'
  await getKysely()
    .insertInto('OAuthAPIProvider')
    .values({
      clientId,
      name: 'Org app',
      clientType: 'public',
      clientSecret: null,
      orgId,
      redirectUris: [redirectUri],
      scopes: aiAppScopes
    })
    .execute()
  const token = await connect({clientId, redirectUri}, cookie, 'users:read')
  await setPolicy(orgId, 'NONE', cookie)
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(viewer.errors).toBeUndefined()
  expect(viewer.data.viewer.id).toBe(userId)
})

test('Verified apps blocks a CIMD client but not Claude', async () => {
  const {userId, cookie, orgId} = await createOrgAdmin(getTestEmail())
  const unverified = await createUnverifiedGlobalClient()
  const claudeToken = await connect(CLAUDE, cookie)
  const unverifiedToken = await connect(unverified, cookie)
  await withoutPrivatePages(userId, CLAUDE.clientId)
  await withoutPrivatePages(userId, unverified.clientId)

  await setPolicy(orgId, 'VERIFIED', cookie)
  const claude = await sendPublic({query: VIEWER_ID, bearerToken: claudeToken})
  expect(claude.errors).toBeUndefined()
  expectNotAllowed(await sendPublic({query: VIEWER_ID, bearerToken: unverifiedToken}))
})

test('a member who leaves an org loses it from the connection immediately', async () => {
  const {userId, cookie} = await createOrgAdmin(getTestEmail())
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  expect(added.errors).toBeUndefined()
  const otherTeamId = added.data.addOrg.team.id as string
  const otherOrgId = added.data.addOrg.team.orgId as string
  const token = await connect(CLAUDE, cookie)

  const before = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
  expect(before.data.viewer.teams.map(({id}: {id: string}) => id)).toContain(otherTeamId)

  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', otherOrgId)
    .where('userId', '=', userId)
    .execute()
  const after = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
  expect(after.errors).toBeUndefined()
  const teamIds = after.data.viewer.teams.map(({id}: {id: string}) => id)
  expect(teamIds).not.toContain(otherTeamId)
  expect(teamIds.length).toBeGreaterThan(0)
})

test('only an org admin with a session can change the policy', async () => {
  const {cookie: memberCookie, orgId: memberOrgId} = await signUp()
  const asMember = await setPolicy(memberOrgId, 'NONE', memberCookie)
  expect(asMember.data).toBeNull()
  expect(asMember.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const {cookie, orgId} = await createOrgAdmin(getTestEmail())
  const pat = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'policy',
      scopes: ['ORGS_WRITE'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(pat.errors).toBeUndefined()
  const withPat = await sendPublic({
    query: UPDATE_ORG_AI_APPS_POLICY,
    variables: {orgId, policy: 'NONE'},
    bearerToken: pat.data.createPersonalAccessToken.token
  })
  expect(withPat.data).toBeNull()
  expect(withPat.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const memberRead = await sendPublic({
    query: ORG_AI_APPS_POLICY,
    variables: {orgId: memberOrgId},
    cookie: memberCookie
  })
  expect(memberRead.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  const adminRead = await sendPublic({query: ORG_AI_APPS_POLICY, variables: {orgId}, cookie})
  expect(adminRead.errors).toBeUndefined()
  expect(adminRead.data.viewer.organization.aiAppsPolicy).toBeNull()
})

test('an org admin cannot delete a global client', async () => {
  const {cookie} = await createOrgAdmin(getTestEmail())
  const claude = await getKysely()
    .selectFrom('OAuthAPIProvider')
    .select('id')
    .where('clientId', '=', CLAUDE.clientId)
    .executeTakeFirstOrThrow()
  const deleted = await sendPublic({
    query: DELETE_OAUTH_API_PROVIDER,
    variables: {providerId: CipherId.toClient(claude.id, 'OAuthAPIProvider')},
    cookie
  })
  expect(deleted.data).toBeNull()
  expect(deleted.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  const survivor = await getKysely()
    .selectFrom('OAuthAPIProvider')
    .select('id')
    .where('id', '=', claude.id)
    .executeTakeFirst()
  expect(survivor).toBeDefined()
})
