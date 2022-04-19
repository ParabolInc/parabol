import {GraphQLResolveInfo} from 'graphql'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import {GQLContext} from '../../graphql'
import fetchGitHubRepos from './fetchGitHubRepos'
import fetchGitLabProjects from './fetchGitLabProjects'
import {getPermsByTaskService, getPrevRepoIntegrations} from './repoIntegrationHelpers'

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context

  const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)
  const [prevRepoIntegrations, jiraProjects, githubRepos, gitlabProjects, jiraServerProjects] =
    await Promise.all([
      getPrevRepoIntegrations(userId, teamId, permLookup),
      dataLoader.get('allJiraProjects').load({teamId, userId}),
      fetchGitHubRepos(teamId, userId, dataLoader, context, info),
      fetchGitLabProjects(teamId, userId, context, info),
      dataLoader.get('allJiraServerProjects').load({teamId, userId})
    ])
  const fetchedRepoIntegrations = [
    ...jiraProjects,
    ...githubRepos,
    ...gitlabProjects,
    ...jiraServerProjects
  ]
  const repoIntegrationsLastUsedAt = {} as {[repoIntegrationId: string]: Date}
  prevRepoIntegrations.forEach((integration) => {
    const integrationId = IntegrationRepoId.join(integration)
    if (!integrationId) return
    repoIntegrationsLastUsedAt[integrationId] = integration.lastUsedAt
  })
  return fetchedRepoIntegrations
    .map((repo) => ({
      ...repo,
      // always have lastUsedAt be a Date (to make the sort easier below)
      lastUsedAt: repoIntegrationsLastUsedAt[repo.id] ?? new Date(0)
    }))
    .sort((a, b) =>
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
