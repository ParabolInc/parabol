import {GQLContext} from './../../graphql'
import {GraphQLResolveInfo} from 'graphql'
import fetchAtlassianProjects from './fetchAtlassianProjects'
import fetchGitHubRepos from './fetchGitHubRepos'

const fetchAllIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [jiraProjects, githubRepos] = await Promise.all([
    fetchAtlassianProjects(teamId, userId, context),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info)
  ])
  const getValue = (item) => (item.nameWithOwner || item.name).toLowerCase()
  return [...jiraProjects, ...githubRepos].sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
}

export default fetchAllIntegrations
