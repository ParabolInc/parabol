import {DataLoaderWorker} from 'server/graphql/graphql'
import fetchAtlassianProjects from 'server/graphql/queries/helpers/fetchAtlassianProjects'
import fetchGitHubRepos from 'server/graphql/queries/helpers/fetchGitHubRepos'

const fetchAllIntegrations = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  const [atlassianProjects, githubRepos] = await Promise.all([
    fetchAtlassianProjects(dataLoader, teamId, userId),
    fetchGitHubRepos(teamId, userId)
  ])
  return [...atlassianProjects, ...githubRepos]
}

export default fetchAllIntegrations
