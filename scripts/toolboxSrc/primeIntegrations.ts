import getPg from '../../packages/server/postgres/getPg'
import upsertIntegrationProvider from '../../packages/server/postgres/queries/upsertIntegrationProvider'

const upsertGlobalIntegrationProvidersFromEnv = async () => {
  const providers = [
    {
      service: 'gitlab',
      authStrategy: 'oauth2',
      scope: 'global',
      teamId: 'aGhostTeam',
      serverBaseUrl: 'https://gitlab.com',
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET
    },
    {
      service: 'azureDevOps',
      authStrategy: 'oauth2',
      scope: 'global',
      teamId: 'aGhostTeam',
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
      teamId: 'aGhostTeam',
      serverBaseUrl: 'https://www.googleapis.com/calendar/v3',
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET
    }
  ] as const

  const validProviders = providers.filter(({clientId, clientSecret}) => clientId && clientSecret)
  await Promise.all(
    validProviders.map((provider) => {
      return upsertIntegrationProvider(provider)
    })
  )
}

const primeIntegrations = async () => {
  console.log('⛓️ Prime Integrationgs Started')
  const pg = getPg()
  await upsertGlobalIntegrationProvidersFromEnv()
  await pg.end()
  console.log('⛓️ Prime Integrations Complete')
}

export default primeIntegrations
