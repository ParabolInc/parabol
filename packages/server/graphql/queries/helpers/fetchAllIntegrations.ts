import {GraphQLResolveInfo} from 'graphql'
import {DataLoaderWorker} from '../../graphql'
import fetchAtlassianProjects from './fetchAtlassianProjects'
import fetchGitHubRepos from './fetchGitHubRepos'

const fetchAllIntegrations = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string,
  context: any,
  info: GraphQLResolveInfo
) => {
  const [atlassianProjects, githubRepos] = await Promise.all([
    fetchAtlassianProjects(dataLoader, teamId, userId),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info)
  ])
  const allIntegrations = [...atlassianProjects, ...githubRepos]
  const getValue = (item) => (item.nameWithOwner || item.projectName).toLowerCase()
  allIntegrations.sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
  return allIntegrations
}

export default fetchAllIntegrations
