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
  const allIntegrations = [...atlassianProjects, ...githubRepos]
  const getValue = (item) => (item.nameWithOwner || item.projectName).toLowerCase()
  allIntegrations.sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
  return allIntegrations
}

export default fetchAllIntegrations
