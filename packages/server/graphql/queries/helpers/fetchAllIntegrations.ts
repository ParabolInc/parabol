import {GraphQLResolveInfo} from 'graphql'
import {JiraProject} from 'parabol-client/utils/AtlassianManager'
import {DataLoaderWorker} from '../../graphql'
import fetchAtlassianProjects from './fetchAtlassianProjects'
import fetchGitHubRepos, {GitHubRepo} from './fetchGitHubRepos'

export type Integration = JiraProject | GitHubRepo

const fetchAllIntegrations = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string,
  context: any,
  info: GraphQLResolveInfo
) => {
  const results = (await Promise.allSettled([
    fetchAtlassianProjects(dataLoader, teamId, userId),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info)
  ])) as PromiseSettledResult<Integration[]>[]

  const allIntegrations = results.flatMap((result) => {
    return result.status === 'fulfilled' ? result.value : []
  })

  const getValue = (item) => (item.nameWithOwner || item.name)?.toLowerCase()
  allIntegrations.sort((a, b) => {
    return getValue(a) < getValue(b) ? -1 : 1
  })
  return allIntegrations
}

export default fetchAllIntegrations
