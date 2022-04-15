import {drainRethink, getUserTeams, sendPublic, signUp} from './common'

afterAll(() => {
  return drainRethink()
})

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

test('Add integration provider', async () => {
  const {userId, authToken} = await signUp()

  const teamId = (await getUserTeams(userId))[0].id

  const addIntegrationProvider = await sendPublic({
    query: `
      mutation AddIntegrationProvider($input: AddIntegrationProviderInput!) {
        addIntegrationProvider(input: $input) {
          __typename
          ... on AddIntegrationProviderSuccess {
            provider {
              id
              isActive
              teamId
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
        teamId,
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
    authToken
  })

  expect(addIntegrationProvider).toMatchObject({
    data: {
      addIntegrationProvider: {
        __typename: 'AddIntegrationProviderSuccess',
        provider: {
          id: expect.anything(),
          isActive: true,
          teamId,
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
    authToken
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
