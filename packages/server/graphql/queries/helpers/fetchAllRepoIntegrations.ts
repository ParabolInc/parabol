import {getPermsByTaskService, getPrevRepoIntegrations} from './repoIntegrationHelpers'
import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
import fetchGitHubRepos from './fetchGitHubRepos'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)
  // get prevRepoIntegrations to determine when the repo was last used
  const [prevRepoIntegrations, jiraProjects, githubRepos] = await Promise.all([
    getPrevRepoIntegrations(userId, teamId, permLookup),
    dataLoader.get('allJiraProjects').load({teamId, userId}),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info)
  ])

  const fetchedRepoIntegrations = [...jiraProjects, ...githubRepos]
  const prevRepoIntegrationsIds = new Set<string>()
  prevRepoIntegrations.forEach((integration) => {
    const integrationId = IntegrationRepoId.join(integration)
    if (!integrationId) return
    prevRepoIntegrationsIds.add(integrationId)
  })
  // always have lastUsedAt be a Date (to make the sort easier below)
  const repoIntegrations = fetchedRepoIntegrations.map((repo) => {
    if (prevRepoIntegrationsIds.has(repo.id)) {
      const prevRepoIntegration = prevRepoIntegrations.find((repoIntegration) => {
        const integrationId = IntegrationRepoId.join(repoIntegration)
        return repo.id === integrationId
      })
      return {
        ...repo,
        lastUsedAt: prevRepoIntegration?.lastUsedAt || new Date(0)
      }
    }
    return {
      ...repo,
      lastUsedAt: new Date(0)
    }
  })

  return repoIntegrations.sort((a, b) =>
    a.lastUsedAt > b.lastUsedAt
      ? -1
      : a.service < b.service
      ? -1
      : a.id.toLowerCase() < b.id.toLowerCase()
      ? -1
      : 1
  )
}

export default fetchAllRepoIntegrations
