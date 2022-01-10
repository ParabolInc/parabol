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
  const results = await Promise.allSettled([
    fetchAtlassianProjects(dataLoader, teamId, userId),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info)
  ])
  const allIntegrations = results.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  )

  const getValue = (item) => (item.nameWithOwner || item.name)?.toLowerCase()
  allIntegrations.sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
  return allIntegrations
}

export default fetchAllIntegrations
