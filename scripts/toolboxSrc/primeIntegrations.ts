import upsertIntegrationProvider from 'parabol-server/postgres/queries/upsertIntegrationProvider'
import getPg from '../../packages/server/postgres/getPg'

const upsertGlobalIntegrationProvidersFromEnv = async () => {
  const providers = [
    {
      service: 'gitlab',
      type: 'oauth2',
      scope: 'global',
      teamId: 'aGhostTeam',
      serverBaseUrl: 'https://gitlab.com',
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET
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
  try {
    const pg = getPg()
    await upsertGlobalIntegrationProvidersFromEnv()
    await pg.end()
  } catch (e) {
    console.log('Prime Integrations error', e)
  }
}

export default primeIntegrations
