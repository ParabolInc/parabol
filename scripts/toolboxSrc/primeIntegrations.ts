import getKysely from '../../packages/server/postgres/getKysely'
import deactivateGlobalIntegrationProvider from '../../packages/server/postgres/queries/deactivateGlobalIntegrationProvider'
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
      service: 'gmeet',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://meet.googleapis.com/v2',
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
    },
    {
      service: 'zoom',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://api.zoom.us/v2',
      clientId: process.env.ZOOM_CLIENT_ID,
      clientSecret: process.env.ZOOM_CLIENT_SECRET
    },
    {
      service: 'jira',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://api.atlassian.com',
      clientId: process.env.ATLASSIAN_CLIENT_ID,
      clientSecret: process.env.ATLASSIAN_CLIENT_SECRET
    },
    {
      service: 'github',
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://api.github.com',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  ] as const

  const validProviders = providers.filter(
    ({authStrategy, clientId, clientSecret, serverBaseUrl, sharedSecret}) =>
      (authStrategy === 'oauth2' && clientId && clientSecret && serverBaseUrl) ||
      (authStrategy === 'sharedSecret' && sharedSecret && serverBaseUrl)
  )

  // it's a security risk to have a misconfigured mattermost provider
  if (!process.env.MATTERMOST_URL || !process.env.MATTERMOST_SECRET) {
    const pg = getKysely()
    await pg
      .deleteFrom('IntegrationProvider')
      .where('service', '=', 'mattermost')
      .where('authStrategy', '=', 'sharedSecret')
      .where('scope', '=', 'global')
      .execute()
  }

  const missingProviders = providers.filter((provider) => !validProviders.includes(provider))

  await Promise.all([
    ...validProviders.map((provider) => upsertIntegrationProvider(provider)),
    ...missingProviders.map(({service, authStrategy}) =>
      deactivateGlobalIntegrationProvider({service, authStrategy})
    )
  ])
}

const primeIntegrations = async () => {
  Logger.log('⛓️ Prime Integrations Started')
  await upsertGlobalIntegrationProvidersFromEnv()
  Logger.log('⛓️ Prime Integrations Complete')
}

// dev bundles this ahead of the Socket Server so global providers track .env on every boot.
// it is an idempotent upsert; a failure (e.g. PG Migrations still running on a fresh DB)
// must not take the server down with it
if (require.main === module) {
  primeIntegrations().catch((e) => Logger.error('⛓️ Prime Integrations Failed', e))
}

export default primeIntegrations
