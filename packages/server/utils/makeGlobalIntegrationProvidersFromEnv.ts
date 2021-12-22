import {IUpsertGlobalIntegrationProviderQueryParams} from '../postgres/queries/generated/upsertGlobalIntegrationProviderQuery'

const hasGitLabConfig = () => !!process.env.GITLAB_CLIENT_ID && !!process.env.GITLAB_CLIENT_SECRET
const createGitLabIntegrationProviderUpsertParams =
  (): IUpsertGlobalIntegrationProviderQueryParams => ({
    provider: 'gitlab',
    name: 'GitLab.com',
    providerMetadata: {
      serverBaseUrl: 'https://gitlab.com',
      scopes: ['read_api'],
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!
    }
  })

const makeGlobalIntegrationProvidersFromEnv = () => {
  const integrationProviders: IUpsertGlobalIntegrationProviderQueryParams[] = []

  if (hasGitLabConfig()) {
    integrationProviders.push(createGitLabIntegrationProviderUpsertParams())
  }

  return integrationProviders
}

export default makeGlobalIntegrationProvidersFromEnv
