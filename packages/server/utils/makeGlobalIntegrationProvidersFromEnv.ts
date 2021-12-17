const makeGlobalIntegrationProvidersFromEnv = (): any[] => {
  const integrationProviders: any[] = []
  if (process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET) {
    integrationProviders.push({
      type: 'gitlab',
      tokenType: 'oauth2',
      scope: 'global',
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
