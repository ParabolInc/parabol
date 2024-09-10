import getPg from '../../packages/server/postgres/getPg'
import upsertIntegrationProvider from '../../packages/server/postgres/queries/upsertIntegrationProvider'

const upsertGlobalIntegrationProvidersFromEnv = async () => {
  const providers = [
    {
      service: 'gitlab',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: process.env.GITLAB_SERVER_URL,
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET
    },
    {
      service: 'azureDevOps',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://dev.azure.com',
      clientId: process.env.AZURE_DEVOPS_CLIENT_ID,
      clientSecret: process.env.AZURE_DEVOPS_CLIENT_SECRET,
      // tenantId needs to be 'common' for apps shared with multiple tenants
      tenantId: 'common'
    },
    {
      service: 'gcal',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://www.googleapis.com/calendar/v3',
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET
    }
  ] as const

  const validProviders = providers.filter(({clientId, clientSecret, serverBaseUrl}) => clientId && clientSecret && serverBaseUrl)
  await Promise.all(
    validProviders.map((provider) => {
      return upsertIntegrationProvider(provider)
    })
  )
}

const primeIntegrations = async () => {
  console.log('⛓️ Prime Integrationgs Started')
  await upsertGlobalIntegrationProvidersFromEnv()
  console.log('⛓️ Prime Integrations Complete')
}

export default primeIntegrations
