import getRethink from '../../../database/rethinkDriver'
import GitHubServerManager from '../../../utils/GitHubServerManager'
import {Omit} from '../../../../client/types/generics'
import {ISuggestedIntegrationGitHub} from '../../../../client/types/graphql'
import {GITHUB} from '../../../../client/utils/constants'
import {GetReposQueryData} from '../../../../client/utils/githubQueries/getRepos.graphql'

const getUniqueRepos = (
  orgs: (GetReposQueryData.ViewerOrganizationsNodes | null)[],
  personalRepos: (GetReposQueryData.ViewerRepositoriesNodes | null)[]
) => {
  const repoSet = new Set()
  const repos = [] as GetReposQueryData.ViewerRepositoriesNodes[]

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

const fetchGitHubRepos = async (teamId: string, userId: string) => {
  const r = await getRethink()
  const auth = await r
    .table('Provider')
    .getAll(teamId, {index: 'teamId'})
    .filter({service: GITHUB, userId, isActive: true})
    .nth(0)
    .default(null)
    .run()
  if (!auth) return []
  const {accessToken} = auth
  const manager = new GitHubServerManager(accessToken)
  const repos = await manager.getRepos()
  if ('message' in repos) {
    console.error(repos)
    return []
  }
  if (Array.isArray(repos.errors)) {
    // TODO handle Oauth forbidden error
    console.error(repos.errors[0])
  }
  const {data} = repos
  if (!data || !data.viewer) return []
  const {viewer} = data
  const {organizations, repositories} = viewer
  const orgs = organizations.nodes || []
  const personalRepos = repositories.nodes || []
  const uniqueRepos = getUniqueRepos(orgs, personalRepos)
  return uniqueRepos.map((repo) => ({
    id: repo.nameWithOwner,
    service: 'github', // TaskServiceEnum.github
    nameWithOwner: repo.nameWithOwner
  })) as Omit<ISuggestedIntegrationGitHub, '__typename'>[]
}

export default fetchGitHubRepos
