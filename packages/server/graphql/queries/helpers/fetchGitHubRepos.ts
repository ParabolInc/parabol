import {GraphQLResolveInfo} from 'graphql'
import {GetRepositoriesQuery} from '../../../types/githubTypes'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import getRepositories from '../../../utils/githubQueries/getRepositories.graphql'
import {DataLoaderWorker} from '../../graphql'

export interface GitHubRepo {
  id: string
  nameWithOwner: string
  hasIssuesEnabled?: boolean
  service: 'github'
}
interface GetRepoOrg {
  repositories: {
    nodes: GitHubRepo[]
  }
}

const getUniqueRepos = <T extends GetRepoOrg, V extends GitHubRepo>(
  orgs: T[],
  personalRepos: V[]
) => {
  const repoSet = new Set()
  const repos = [] as GitHubRepo[]

  // add in the organization repos
  for (let i = 0; i < orgs.length; i++) {
    const organization = orgs[i]
    if (!organization) continue
    const orgRepos = organization.repositories.nodes
    if (!orgRepos) continue
    for (let j = 0; j < orgRepos.length; j++) {
      const repo = orgRepos[j]
      if (!repo) continue
      repoSet.add(repo.nameWithOwner)
      repos.push(repo)
    }
  }
  // add in repos from personal & collaborations
  for (let i = 0; i < personalRepos.length; i++) {
    const repo = personalRepos[i]
    if (!repo) continue
    if (!repoSet.has(repo.nameWithOwner)) {
      repos.push(repo)
    }
  }
  return repos
}

const fetchGitHubRepos = async (
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker,
  context: any,
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
  const orgs = organizations.nodes || []
  const personalRepos = repositories.nodes || []
  const uniqueRepos = getUniqueRepos(orgs as any, personalRepos as any)
  return uniqueRepos
    .filter(({hasIssuesEnabled}) => hasIssuesEnabled)
    .map((repo) => ({
      id: repo.nameWithOwner,
      service: 'github',
      nameWithOwner: repo.nameWithOwner
    }))
}

export default fetchGitHubRepos
