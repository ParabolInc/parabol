import upsertIntegrationProvider from '../../packages/server/postgres/queries/upsertIntegrationProvider'
import {Logger} from '../../packages/server/utils/Logger'

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
    },
    {
      service: 'mattermost',
      authStrategy: 'sharedSecret',
      scope: 'global',
      serverBaseUrl: process.env.MATTERMOST_URL,
      sharedSecret: process.env.MATTERMOST_SECRET
    },
    {
      service: 'linear',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://linear.app/',
      clientId: process.env.LINEAR_CLIENT_ID,
      clientSecret: process.env.LINEAR_CLIENT_SECRET
    }
  ] as const

  const validProviders = providers.filter(
    ({authStrategy, clientId, clientSecret, serverBaseUrl, sharedSecret}) =>
      (authStrategy === 'oauth2' && clientId && clientSecret && serverBaseUrl) ||
      (authStrategy === 'sharedSecret' && sharedSecret && serverBaseUrl)
  )

  await Promise.all(
    validProviders.map((provider) => {
      return upsertIntegrationProvider(provider)
    })
  )
}

const primeIntegrations = async () => {
  Logger.log('⛓️ Prime Integrationgs Started')
  await upsertGlobalIntegrationProvidersFromEnv()
  Logger.log('⛓️ Prime Integrations Complete')
}

export default primeIntegrations
