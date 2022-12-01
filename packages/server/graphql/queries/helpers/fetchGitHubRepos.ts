import {GraphQLResolveInfo} from 'graphql'
import {GetRepositoriesQuery} from '../../../types/githubTypes'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import getRepositories from '../../../utils/githubQueries/getRepositories.graphql'
import {DataLoaderWorker} from '../../graphql'
import {GQLContext} from './../../graphql'

export interface GitHubRepo {
  id: string
  nameWithOwner: string
  hasIssuesEnabled?: boolean
  service: 'github'
}

const fetchGitHubRepos = async (
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const auth = await dataLoader.get('githubAuth').load({teamId, userId})
  if (!auth) return []
  const {accessToken} = auth
  const githubRequest = getGitHubRequest(info, context, {accessToken})
  const [data, error] = await githubRequest<GetRepositoriesQuery>(getRepositories)
  if (error) {
    console.error(error.message)
    return []
  }
  const {viewer} = data
  const {organizations, repositories} = viewer
  const orgs = organizations.nodes
  const orgRepos = orgs?.flatMap((org) => org?.repositories.nodes) || []
  const viewerRepos = repositories.nodes || []
  const allRepos = [...viewerRepos, ...orgRepos]
  const repoSet = new Set<string>()
  const repos = [] as {id: string; service: 'github'; nameWithOwner: string}[]
  allRepos.forEach((repo) => {
    if (!repo) return
    const {nameWithOwner, hasIssuesEnabled} = repo
    if (repoSet.has(nameWithOwner) || !hasIssuesEnabled) return
    repoSet.add(nameWithOwner)
    repos.push({
      id: nameWithOwner,
      service: 'github' as const,
      nameWithOwner
    })
  })
  return repos
}

export default fetchGitHubRepos
