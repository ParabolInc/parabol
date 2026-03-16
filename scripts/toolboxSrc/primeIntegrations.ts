import appOrigin from '../../packages/server/appOrigin'
import getKysely from '../../packages/server/postgres/getKysely'
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
      // MATTERMOST_SECRET is now optional — used only for signing outgoing notification
      // requests to the Mattermost plugin's /notify endpoint. No longer used for user auth.
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
      // sharedSecret is now optional for the Mattermost provider (used for notification signing only)
      (authStrategy === 'sharedSecret' && serverBaseUrl)
  )

  // Remove stale Mattermost IntegrationProvider only when MATTERMOST_URL is not configured
  if (!process.env.MATTERMOST_URL) {
    const pg = getKysely()
    await pg
      .deleteFrom('IntegrationProvider')
      .where('service', '=', 'mattermost')
      .where('authStrategy', '=', 'sharedSecret')
      .where('scope', '=', 'global')
      .execute()
  }

  await Promise.all(
    validProviders.map((provider) => {
      return upsertIntegrationProvider(provider)
    })
  )

  // Register the Mattermost plugin as an OAuthAPIProvider so users can authenticate
  // via Parabol's OAuth2 server instead of the old shared-secret webhook
  const pg = getKysely()
  if (process.env.MATTERMOST_OAUTH_CLIENT_ID && process.env.MATTERMOST_OAUTH_CLIENT_SECRET) {
    await pg
      .insertInto('OAuthAPIProvider')
      .values({
        orgId: null,
        name: 'Mattermost Plugin',
        clientId: process.env.MATTERMOST_OAUTH_CLIENT_ID,
        clientSecret: process.env.MATTERMOST_OAUTH_CLIENT_SECRET,
        redirectUris: [appOrigin + '/mattermost/callback'],
        scopes: ['graphql:persisted']
      })
      .onConflict((oc) =>
        oc.column('clientId').doUpdateSet({
          clientSecret: process.env.MATTERMOST_OAUTH_CLIENT_SECRET!,
          redirectUris: [appOrigin + '/mattermost/callback']
        })
      )
      .execute()
  } else {
    // Clean up stale Mattermost OAuth provider if env vars were removed
    await pg
      .deleteFrom('OAuthAPIProvider')
      .where('name', '=', 'Mattermost Plugin')
      .where('orgId', 'is', null)
      .execute()
  }
}

const primeIntegrations = async () => {
  Logger.log('⛓️ Prime Integrationgs Started')
  await upsertGlobalIntegrationProvidersFromEnv()
  Logger.log('⛓️ Prime Integrations Complete')
}

export default primeIntegrations
