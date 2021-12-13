import {GlobalIntegrationProviderInput} from '../postgres/types/IIntegrationProviderAndToken'

const makeGlobalIntegrationProvidersFromEnv = (): GlobalIntegrationProviderInput[] => {
  const integrationProviders: GlobalIntegrationProviderInput[] = []
  if (process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET) {
    integrationProviders.push({
      type: 'GITLAB',
      tokenType: 'OAUTH2',
      scope: 'GLOBAL',
      isActive: true,
      name: 'GitLab.com',
      serverBaseUri: 'https://gitlab.com',
      oauthScopes: ['read_api'],
      oauthClientId: process.env.GITLAB_CLIENT_ID,
      oauthClientSecret: process.env.GITLAB_CLIENT_SECRET
    })
  }

  return integrationProviders
}

export default makeGlobalIntegrationProvidersFromEnv
