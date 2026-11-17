import http from 'http'
import type {AddressInfo} from 'net'
import {getUserOrgs, getUserTeams, sendIntranet, sendPublic, signUp} from './common'

const serverBaseUrl = 'https://jira.example.com/'
const consumerKey = 'CvSE+9fww8PLH07mWTHKUZMiGyX7liUSFbB1pRLVDyQ='
const consumerSecret = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQC7pZ1qCXvNq2DnTtD3d7X913IhJTwaKhWsu5/qgSsb1J7fVZFL
XlkvHCxhB0Lu/ByMzzQ5t0PJR3mkSjNV68j1TjM8Z4d+F+0+kxrUn8HteiBqVhlA
oYZeHljcvULWm9tVOFAk7CmEskQ3JQQhvPsAkpTvgaBrLdYAJILic9EymQIDAQAB
AoGANv8rS9DLwFPiaujmxiEH7gYfJSfMnb6H68Bx9kE1aUq/5aUmmHhmmzAesbF3
JKQvmfWA0QmtjGiudkBpG12n3/zYy9NCVmaoBGIn5FSMEndZBPc9KIZSn9OmTzhQ
MNgZ66FXROqp/9UrXRYToxCrmUXk+4ciCPVq6/aITQI+HAECQQDspIWF1/rsqMWn
wbbMRoqho/sUuEYxufWZzehwtjPrVQbJPKR3ggFNOZ2bF5ATfgwHvnvCoVO3cH0f
XJ+HDZ8xAkEAyv8V0/SwJn2U000Wn400hqkNRB9oo0FKeSi3iu5khl87n/omHvHL
shYxB59AraoH0jD0mPb8tSUzP07xpRJ/6QJAHK5H/JPTtrEx24Yv6Iw4KyUbvkQj
Rc2bBbweCuMaYdBZVTSDXnSkQb7U6kIt1R72yE1+5HT3F4mLsKxiLVUqUQJAGbPW
pbGzpAv+jgqStL0CS5KYFWoMq68WqOSY6MRqggEI4aagsQZYjkH1D0wAunxu5RRB
xCRxttXw+TEbs5T2EQJBANPcs2ztuKos+j0eYBKzhFDWccEYtBOLvJE5uUaxUa8v
18+QaDAitvKYcXZX+GuWSDI6b3xsuO7ANzF0rZRLR7M=
-----END RSA PRIVATE KEY-----
`

const setOrgUserRole = async (orgId: string, userId: string, role: string) => {
  const setOrgUserRole = await sendIntranet({
    query: `
      mutation SetOrgUserRole($orgId: ID!, $userId: ID!, $role: OrgUserRole!) {
        setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
          __typename
        }
      }
    `,
    variables: {
      orgId,
      userId,
      role
    }
  })

  expect(setOrgUserRole).toMatchObject({
    data: {
      setOrgUserRole: {
        __typename: 'SetOrgUserRoleSuccess'
      }
    }
  })

  return setOrgUserRole
}

const addJiraServerProvider = (orgId: string, cookie: string, serverBaseUrl: string) =>
  sendPublic({
    query: `
      mutation AddIntegrationProvider($input: AddIntegrationProviderInput!) {
        addIntegrationProvider(input: $input) {
          __typename
          ... on AddIntegrationProviderSuccess {
            provider {
              id
              isActive
              teamId
              orgId
              ... on IntegrationProviderOAuth1 {
                serverBaseUrl
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        orgId,
        service: 'jiraServer',
        authStrategy: 'oauth1',
        scope: 'org',
        oAuth1ProviderMetadataInput: {
          serverBaseUrl,
          consumerKey,
          consumerSecret
        }
      }
    },
    cookie
  })

const signUpOrgAdmin = async () => {
  const {userId, cookie} = await signUp()
  const orgId = (await getUserOrgs(userId))[0].id
  const teamId = (await getUserTeams(userId))[0].id
  await setOrgUserRole(orgId, userId, 'ORG_ADMIN')
  return {cookie, orgId, teamId}
}

const CREATE_OAUTH1_AUTHORIZE_URL = `
  mutation CreateOAuth1AuthorizeUrl($providerId: ID!, $teamId: ID!) {
    createOAuth1AuthorizeUrl(providerId: $providerId, teamId: $teamId) {
      error {
        message
      }
      url
    }
  }
`

let requestTokenCount = 0
const jiraServer = http.createServer((_req, res) => {
  requestTokenCount++
  res.end('oauth_callback_confirmed=true&oauth_token=requestToken1')
})
let jiraServerUrl: string

beforeAll(async () => {
  await new Promise<void>((resolve) => jiraServer.listen(0, '127.0.0.1', resolve))
  jiraServerUrl = `http://127.0.0.1:${(jiraServer.address() as AddressInfo).port}`
})

afterAll(() => {
  jiraServer.close()
})

test('Add integration provider', async () => {
  const {userId, cookie} = await signUp()

  const orgId = (await getUserOrgs(userId))[0].id
  const teamId = (await getUserTeams(userId))[0].id

  await setOrgUserRole(orgId, userId, 'ORG_ADMIN')

  const addIntegrationProvider = await addJiraServerProvider(orgId, cookie, serverBaseUrl)

  expect(addIntegrationProvider).toMatchObject({
    data: {
      addIntegrationProvider: {
        __typename: 'AddIntegrationProviderSuccess',
        provider: {
          id: expect.anything(),
          isActive: true,
          orgId,
          teamId: null,
          serverBaseUrl
        }
      }
    }
  })
  const providerId = addIntegrationProvider.data.addIntegrationProvider.provider.id

  const integrationViewer = await sendPublic({
    query: `
      query Viewer($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              jiraServer {
                auth {
                  id
                }
                sharedProviders {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      teamId
    },
    cookie
  })

  expect(integrationViewer).toMatchObject({
    data: {
      viewer: {
        teamMember: {
          integrations: {
            jiraServer: {
              auth: null,
              sharedProviders: [
                {
                  id: providerId
                }
              ]
            }
          }
        }
      }
    }
  })
})

test('an OAuth1 authorize URL is created for a team in the provider’s organization', async () => {
  const {cookie, orgId, teamId} = await signUpOrgAdmin()
  const added = await addJiraServerProvider(orgId, cookie, jiraServerUrl)
  const providerId = added.data.addIntegrationProvider.provider.id

  const res = await sendPublic({
    query: CREATE_OAUTH1_AUTHORIZE_URL,
    variables: {providerId, teamId},
    cookie
  })

  expect(res).toEqual({
    data: {
      createOAuth1AuthorizeUrl: {
        error: null,
        url: `${jiraServerUrl}/plugins/servlet/oauth/authorize?oauth_token=requestToken1`
      }
    }
  })
})

test('an OAuth1 authorize URL is refused for a team outside the provider’s organization', async () => {
  const [{cookie, orgId}, outsider] = await Promise.all([signUpOrgAdmin(), signUp()])
  const added = await addJiraServerProvider(orgId, cookie, jiraServerUrl)
  const providerId = added.data.addIntegrationProvider.provider.id
  const requestTokenCountBefore = requestTokenCount

  const res = await sendPublic({
    query: CREATE_OAUTH1_AUTHORIZE_URL,
    variables: {providerId, teamId: outsider.teamId},
    cookie: outsider.cookie
  })

  expect(res).toEqual({
    data: {createOAuth1AuthorizeUrl: null},
    errors: [
      expect.objectContaining({
        message: 'Provider is not available to this team',
        extensions: expect.objectContaining({code: 'FORBIDDEN'})
      })
    ]
  })
  expect(requestTokenCount).toBe(requestTokenCountBefore)
})
