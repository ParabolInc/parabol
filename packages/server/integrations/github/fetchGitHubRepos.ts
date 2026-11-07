import type {GraphQLResolveInfo} from 'graphql'
import type {DataLoaderWorker, GQLContext} from '../../graphql/graphql'
import type {GetRepositoriesQuery} from '../../types/githubTypes'
import getRepositories from '../../utils/githubQueries/getRepositories.graphql'
import getGitHubRequest from './getGitHubRequest'

type GitHubRepoNode = NonNullable<
  NonNullable<GetRepositoriesQuery['viewer']['repositories']['nodes']>[number]
>

export type GitHubRepo = GitHubRepoNode & {service: 'github'}

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
    repos.push({...repo, service: 'github' as const})
  })
  return repos
}

export default fetchGitHubRepos
