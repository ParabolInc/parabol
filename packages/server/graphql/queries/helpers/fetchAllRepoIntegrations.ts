import {GQLContext} from '../../graphql'
import {GraphQLResolveInfo} from 'graphql'
import fetchAtlassianProjects from './fetchAtlassianProjects'
import fetchGitHubRepos from './fetchGitHubRepos'
import fetchJiraServerProjects from './fetchJiraServerProjects'

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [jiraProjects, githubRepos, jiraServerProjects] = await Promise.all([
    fetchAtlassianProjects(teamId, userId, context),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info),
    fetchJiraServerProjects(teamId, userId, dataLoader)
  ])
  const getValue = (item) => (item.nameWithOwner || item.name).toLowerCase()
  const repoIntegrations = [...jiraProjects, ...githubRepos, ...jiraServerProjects].sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
  return repoIntegrations
}

export default fetchAllRepoIntegrations
