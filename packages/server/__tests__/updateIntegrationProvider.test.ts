import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const addGitLabProvider = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation AddIntegrationProvider($input: AddIntegrationProviderInput!) {
        addIntegrationProvider(input: $input) {
          ... on AddIntegrationProviderSuccess {
            provider {
              id
            }
          }
        }
      }
    `,
    variables: {
      input: {
        teamId,
        service: 'gitlab',
        authStrategy: 'oauth2',
        scope: 'team',
        oAuth2ProviderMetadataInput: {
          serverBaseUrl: 'https://gitlab.example.com',
          clientId: 'original-client',
          clientSecret: 'original-secret'
        }
      }
    },
    cookie
  })
  return res.data.addIntegrationProvider.provider.id as string
}

const removeProvider = async (providerId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation RemoveIntegrationProvider($providerId: ID!) {
        removeIntegrationProvider(providerId: $providerId) {
          __typename
        }
      }
    `,
    variables: {providerId},
    cookie
  })
  expect(res).toEqual({
    data: {removeIntegrationProvider: {__typename: 'RemoveIntegrationProviderSuccess'}}
  })
}

const updateProvider = (providerId: string, cookie: string) =>
  sendPublic({
    query: `
      mutation UpdateIntegrationProvider($provider: UpdateIntegrationProviderInput!) {
        updateIntegrationProvider(provider: $provider) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on UpdateIntegrationProviderSuccess {
            provider {
              id
              ... on IntegrationProviderOAuth2 {
                clientId
                serverBaseUrl
              }
            }
          }
        }
      }
    `,
    variables: {
      provider: {
        id: providerId,
        oAuth2ProviderMetadataInput: {
          serverBaseUrl: 'https://gitlab-updated.example.com',
          clientId: 'updated-client',
          clientSecret: 'updated-secret'
        }
      }
    },
    cookie
  })

const selectProvider = (providerId: string) =>
  getKysely()
    .selectFrom('IntegrationProvider')
    .select(['clientId', 'clientSecret', 'serverBaseUrl', 'isActive'])
    .where('id', '=', IntegrationProviderId.split(providerId))
    .executeTakeFirstOrThrow()

test('Updating an active provider returns it with the new metadata', async () => {
  const {teamId, cookie} = await signUp()
  const providerId = await addGitLabProvider(teamId, cookie)

  const res = await updateProvider(providerId, cookie)
  expect(res).toEqual({
    data: {
      updateIntegrationProvider: {
        provider: {
          id: providerId,
          clientId: 'updated-client',
          serverBaseUrl: 'https://gitlab-updated.example.com'
        }
      }
    }
  })
})

test('Updating a removed provider is refused and leaves it untouched', async () => {
  const {teamId, cookie} = await signUp()
  const providerId = await addGitLabProvider(teamId, cookie)
  await removeProvider(providerId, cookie)

  const res = await updateProvider(providerId, cookie)
  expect(res).toEqual({
    data: {
      updateIntegrationProvider: {
        error: {message: 'Invalid provider ID'}
      }
    }
  })
  expect(await selectProvider(providerId)).toEqual({
    clientId: 'original-client',
    clientSecret: 'original-secret',
    serverBaseUrl: 'https://gitlab.example.com',
    isActive: false
  })
})
