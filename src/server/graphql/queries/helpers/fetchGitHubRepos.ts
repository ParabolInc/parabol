import fetch from 'node-fetch'
import getRethink from 'server/database/rethinkDriver'
import {Omit} from 'types/generics'
import {ISuggestedIntegrationGitHub} from 'universal/types/graphql'
import {GITHUB} from 'universal/utils/constants'
import GitHubClientManager from 'universal/utils/GitHubClientManager'

interface Repo {
  nameWithOwner: string
  viewerCanAdminister: boolean
  updatedAt: string
}

interface GitHubOrg {
  repositories: {
    nodes: Repo[]
  }
}

const getUniqueRepos = (orgs: GitHubOrg[], personalRepos: Repo[]) => {
  const repoSet = new Set()
  const repos = [] as Array<Repo>

  // add in the organization repos
  for (let i = 0; i < orgs.length; i++) {
    const organization = orgs[i]
    const orgRepos = organization.repositories.nodes
    for (let j = 0; j < orgRepos.length; j++) {
      const repo = orgRepos[j]
      repoSet.add(repo.nameWithOwner)
      repos.push(repo)
    }
  }
  // add in repos from personal & collaborations
  for (let i = 0; i < personalRepos.length; i++) {
    const repo = personalRepos[i]
    if (!repoSet.has(repo.nameWithOwner)) {
      repos.push(repo)
    }
  }
  return repos
}

const fetchGitHubRepos = async (teamId: string, userId: string) => {
  const r = getRethink()
  const auth = await r
    .table('Provider')
    .getAll(teamId, {index: 'teamId'})
    .filter({service: GITHUB, userId, isActive: true})
    .nth(0)
    .default(null)
  if (!auth) return []
  const {accessToken} = auth
  const manager = new GitHubClientManager(accessToken, {fetch})
  const repos = await manager.getRepos()
  if ('message' in repos) {
    console.error(repos)
    return []
  }
  if ('errors' in repos) {
    // TODO handle Oauth forbidden error
    console.error(repos.errors[0])
  }
  const {data} = repos
  if (!data || !data.viewer) return []
  const {viewer} = data
  const {organizations, repositories} = viewer
  const {nodes: orgs} = organizations
  const {nodes: personalRepos} = repositories
  const uniqueRepos = getUniqueRepos(orgs, personalRepos)
  return uniqueRepos.map((repo) => ({
    id: repo.nameWithOwner,
    service: 'github', // TaskServiceEnum.github
    nameWithOwner: repo.nameWithOwner
  })) as Omit<ISuggestedIntegrationGitHub, '__typename'>[]
}

export default fetchGitHubRepos
