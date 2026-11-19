import crypto from 'crypto'
import generateUID from '../generateUID'
import aiAppScopes from '../oauth2/aiAppScopes'
import getKysely from '../postgres/getKysely'
import type {Orgaiappspolicyenum} from '../postgres/types/pg'
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

const OAUTH_AUTHORIZATION_REQUEST = `
  query OAuthAuthorizationRequest($request: OAuthAuthorizationRequestInput!) {
    viewer {
      oauthAuthorizationRequest(request: $request) {
        verifiedAt
        clientHost
        organizations {
          organization {
            id
            name
          }
          blockedReason
          adminName
        }
      }
    }
  }
`

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

const VIEWER_TEAMS = `
  query ViewerTeams {
    viewer {
      teams {
        id
      }
    }
  }
`

const VIEWER_NOTIFICATIONS = `
  query ViewerNotifications {
    viewer {
      notifications(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

interface ConsentChoice {
  grantedOrgIds?: string[] | null
  includePrivate?: boolean
}

const toRequest = (
  client: Client,
  codeChallenge = crypto.randomBytes(32).toString('base64url')
) => ({
  ...client,
  state: 'xyz',
  codeChallenge,
  codeChallengeMethod: 'S256'
})

const requestConsent = async (client: Client, cookie: string) => {
  const consent = await sendPublic({
    query: OAUTH_AUTHORIZATION_REQUEST,
    variables: {request: toRequest(client)},
    cookie
  })
  expect(consent.errors).toBeUndefined()
  return consent.data.viewer.oauthAuthorizationRequest
}

const approve = (client: Client, cookie: string, choice: ConsentChoice, codeChallenge?: string) =>
  sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {
      request: toRequest(client, codeChallenge),
      grantedOrgIds: choice.grantedOrgIds,
      includePrivate: choice.includePrivate ?? false
    },
    cookie
  })

const connect = async (client: Client, cookie: string, choice: ConsentChoice) => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const approved = await approve(client, cookie, choice, codeChallenge)
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

const createGlobalClient = async (verifiedAt: Date | null): Promise<Client> => {
  const clientId = `global-test-${generateUID()}`
  const redirectUri = 'https://app.example.com/callback'
  await getKysely()
    .insertInto('OAuthAPIProvider')
    .values({
      clientId,
      name: 'Global test app',
      clientType: 'public',
      clientSecret: null,
      orgId: null,
      redirectUris: [redirectUri],
      scopes: aiAppScopes,
      verifiedAt
    })
    .execute()
  return {clientId, redirectUri}
}

const setPolicy = (orgId: string, aiAppsPolicy: Orgaiappspolicyenum) =>
  getKysely().updateTable('Organization').set({aiAppsPolicy}).where('id', '=', orgId).execute()

const joinOrg = (userId: string, orgId: string) =>
  getKysely()
    .insertInto('OrganizationUser')
    .values({id: generateUID(), orgId, userId, role: null})
    .execute()

const selectOrgName = async (orgId: string) => {
  const {name} = await getKysely()
    .selectFrom('Organization')
    .select('name')
    .where('id', '=', orgId)
    .executeTakeFirstOrThrow()
  return name
}

const selectPreferredName = async (userId: string) => {
  const {preferredName} = await getKysely()
    .selectFrom('User')
    .select('preferredName')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow()
  return preferredName
}

const selectGrant = (userId: string, clientId: string) =>
  getKysely()
    .selectFrom('OAuthAPIGrant')
    .select(['grantedOrgIds', 'personalGrantedAt'])
    .where('clientId', '=', clientId)
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()

const createPage = async (cookie: string, teamId?: string) => {
  const res = await sendPublic({query: CREATE_PAGE, variables: {teamId}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data.createPage.page.id as string
}

const setUpThreeOrgs = async () => {
  const viewer = await signUp()
  const verifiedOnly = await createOrgAdmin(getTestEmail())
  const noApps = await createOrgAdmin(getTestEmail())
  await setPolicy(verifiedOnly.orgId, 'verified')
  await setPolicy(noApps.orgId, 'none')
  await joinOrg(viewer.userId, verifiedOnly.orgId)
  await joinOrg(viewer.userId, noApps.orgId)
  return {viewer, verifiedOnly, noApps}
}

const byOrgId = (organizations: {organization: {id: string}}[]) =>
  Object.fromEntries(organizations.map((row) => [row.organization.id, row]))

test('the consent request lists each org with why it is blocked', async () => {
  const {viewer, verifiedOnly, noApps} = await setUpThreeOrgs()
  const unverified = await createGlobalClient(null)

  const claude = await requestConsent(CLAUDE, viewer.cookie)
  expect(claude.verifiedAt).toEqual(expect.any(String))
  expect(claude.clientHost).toBe('claude.ai')
  expect(claude.organizations).toHaveLength(3)
  const claudeOrgs = byOrgId(claude.organizations)
  expect(claudeOrgs[viewer.orgId]).toMatchObject({blockedReason: null, adminName: null})
  expect(claudeOrgs[verifiedOnly.orgId]).toMatchObject({blockedReason: null, adminName: null})
  expect(claudeOrgs[noApps.orgId]).toEqual({
    organization: {id: noApps.orgId, name: await selectOrgName(noApps.orgId)},
    blockedReason: 'NO_APPS',
    adminName: await selectPreferredName(noApps.userId)
  })

  const cimd = await requestConsent(unverified, viewer.cookie)
  expect(cimd.verifiedAt).toBeNull()
  expect(cimd.clientHost).toBe('app.example.com')
  const cimdOrgs = byOrgId(cimd.organizations)
  expect(cimdOrgs[viewer.orgId]).toMatchObject({blockedReason: null})
  expect(cimdOrgs[verifiedOnly.orgId]).toMatchObject({
    blockedReason: 'VERIFIED_ONLY',
    adminName: await selectPreferredName(verifiedOnly.userId)
  })
  expect(cimdOrgs[noApps.orgId]).toMatchObject({blockedReason: 'NO_APPS'})

  await getKysely()
    .updateTable('Organization')
    .set({aiAppsPolicy: null, useAI: false})
    .where('id', '=', noApps.orgId)
    .execute()
  const followsUseAI = byOrgId((await requestConsent(CLAUDE, viewer.cookie)).organizations)
  expect(followsUseAI[noApps.orgId]).toMatchObject({blockedReason: 'NO_APPS'})

  const orgClientId = `org-test-${generateUID()}`
  await getKysely()
    .insertInto('OAuthAPIProvider')
    .values({
      clientId: orgClientId,
      name: 'Org app',
      clientType: 'public',
      clientSecret: null,
      orgId: viewer.orgId,
      redirectUris: ['https://app.example.com/callback'],
      scopes: aiAppScopes
    })
    .execute()
  const orgOwned = await requestConsent(
    {clientId: orgClientId, redirectUri: 'https://app.example.com/callback'},
    viewer.cookie
  )
  expect(orgOwned.organizations).toEqual([])
})

test('picking a blocked org is refused', async () => {
  const {viewer, noApps} = await setUpThreeOrgs()
  const blocked = await approve(CLAUDE, viewer.cookie, {grantedOrgIds: [noApps.orgId]})
  expect(blocked.data).toBeNull()
  expect(blocked.errors?.[0]).toMatchObject({
    message: `You can't give this app access to ${await selectOrgName(noApps.orgId)}`,
    extensions: {code: 'BAD_USER_INPUT'}
  })

  const stranger = await createOrgAdmin(getTestEmail())
  const strangerOrgName = await selectOrgName(stranger.orgId)
  const foreign = await approve(CLAUDE, viewer.cookie, {
    grantedOrgIds: [viewer.orgId, stranger.orgId]
  })
  expect(foreign.data).toBeNull()
  expect(foreign.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  expect(foreign.errors?.[0]?.message).not.toContain(strangerOrgName)
})

test('"All my organizations" stores null, so a later org is included while it allows apps', async () => {
  const {userId, cookie} = await signUp()
  const token = await connect(CLAUDE, cookie, {grantedOrgIds: null, includePrivate: true})
  expect(await selectGrant(userId, CLAUDE.clientId)).toEqual({
    grantedOrgIds: null,
    personalGrantedAt: expect.any(Date)
  })

  const added = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  expect(added.errors).toBeUndefined()
  const laterTeamId = added.data.addOrg.team.id as string
  const laterOrgId = added.data.addOrg.team.orgId as string
  const teamIds = async () => {
    const res = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
    expect(res.errors).toBeUndefined()
    return res.data.viewer.teams.map(({id}: {id: string}) => id)
  }
  expect(await teamIds()).toContain(laterTeamId)
  await setPolicy(laterOrgId, 'none')
  expect(await teamIds()).not.toContain(laterTeamId)
})

test('choosing nothing is refused', async () => {
  const {userId, cookie, orgId} = await signUp()
  const nothing = await approve(CLAUDE, cookie, {grantedOrgIds: [], includePrivate: false})
  expect(nothing.data).toBeNull()
  expect(nothing.errors?.[0]).toMatchObject({
    message: 'Choose at least one organization or your private pages',
    extensions: {code: 'BAD_USER_INPUT'}
  })

  await connect(CLAUDE, cookie, {grantedOrgIds: [orgId], includePrivate: false})
  expect(await selectGrant(userId, CLAUDE.clientId)).toEqual({
    grantedOrgIds: [orgId],
    personalGrantedAt: null
  })
})

test('a private-pages-only connection reaches private pages and nothing in any org', async () => {
  const {userId, cookie, teamId} = await signUp()
  const privatePageId = await createPage(cookie)
  const teamPageId = await createPage(cookie, teamId)
  const token = await connect(CLAUDE, cookie, {grantedOrgIds: [], includePrivate: true})
  expect(await selectGrant(userId, CLAUDE.clientId)).toEqual({
    grantedOrgIds: [],
    personalGrantedAt: expect.any(Date)
  })

  const privatePage = await sendPublic({
    query: PAGE,
    variables: {pageId: privatePageId},
    bearerToken: token
  })
  expect(privatePage.errors).toBeUndefined()
  expect(privatePage.data.public.page.id).toBe(privatePageId)
  const notifications = await sendPublic({query: VIEWER_NOTIFICATIONS, bearerToken: token})
  expect(notifications.errors).toBeUndefined()

  const teamPage = await sendPublic({
    query: PAGE,
    variables: {pageId: teamPageId},
    bearerToken: token
  })
  expect(teamPage.data?.public?.page ?? null).toBeNull()
  const teams = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
  expect(teams.errors).toBeUndefined()
  expect(teams.data.viewer.teams).toEqual([])
})
