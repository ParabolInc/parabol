import {GlobalIntegrationProviderInput} from '../types/IntegrationProviderAndTokenT'

const makeGlobalIntegrationProvidersFromEnv = (): GlobalIntegrationProviderInput[] => {
  let integrationProviders: GlobalIntegrationProviderInput[] = []
  if (process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET) {
    integrationProviders.push({
      providerType: 'GITLAB',
      providerTokenType: 'OAUTH2',
      providerScope: 'GLOBAL',
      isActive: true,
      name: 'GitLab.com',
      serverBaseUri: 'https://gitlab.com',
      scopes: ['read_api'],
      oauthClientId: process.env.GITLAB_CLIENT_ID,
      oauthClientSecret: process.env.GITLAB_CLIENT_SECRET
    })
  }

  return integrationProviders
}

export default makeGlobalIntegrationProvidersFromEnv
