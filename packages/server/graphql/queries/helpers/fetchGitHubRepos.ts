import type {GraphQLResolveInfo} from 'graphql'
import type {GitHubRepo} from '../../../integrations/platform/RemoteRepoIntegration'
import type {GetRepositoriesQuery} from '../../../types/githubTypes'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import getRepositories from '../../../utils/githubQueries/getRepositories.graphql'
import type {GQLContext} from './../../graphql'
import type {DataLoaderWorker} from '../../graphql'

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
  if (error) return error
  const {viewer} = data
  const {organizations, repositories} = viewer
  const orgs = organizations.nodes
  const orgRepos = orgs?.flatMap((org) => org?.repositories.nodes) || []
  const viewerRepos = repositories.nodes || []
  const allRepos = [...viewerRepos, ...orgRepos]
  const repoSet = new Set<string>()
  const repos: GitHubRepo[] = []
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
