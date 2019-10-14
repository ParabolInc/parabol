import {DataLoaderWorker} from '../../graphql'
import fetchAtlassianProjects from './fetchAtlassianProjects'
import fetchAzureDevopsProjects from './fetchAzureDevopsProjects'
import fetchGitHubRepos from './fetchGitHubRepos'

const fetchAllIntegrations = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  const [atlassianProjects, azureDevopsProjects, githubRepos] = await Promise.all([
    fetchAtlassianProjects(dataLoader, teamId, userId),
    fetchAzureDevopsProjects(dataLoader, teamId, userId),
    fetchGitHubRepos(teamId, userId)
  ])
  const allIntegrations = [...atlassianProjects, ...azureDevopsProjects, ...githubRepos]
  const getValue = (item) => (item.nameWithOwner || item.projectName).toLowerCase()
  allIntegrations.sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
  return allIntegrations
}

export default fetchAllIntegrations
