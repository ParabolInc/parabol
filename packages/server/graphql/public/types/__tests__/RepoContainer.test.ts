jest.mock('../../rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {
  GitHubRepo,
  GitLabProject,
  LinearProject,
  LinearTeam
} from '../../../../integrations/platform/RemoteRepoIntegration'
import RepoContainer from '../RepoContainer'

const resolve = (resolver: unknown, source: unknown) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(source)
}

const gitHubRepo: GitHubRepo = {
  id: 'ParabolInc/parabol',
  service: 'github',
  nameWithOwner: 'ParabolInc/parabol'
}

const gitLabProject: GitLabProject = {
  __typename: 'Project',
  id: 'gid://gitlab/Project/1',
  fullPath: 'acme/web',
  service: 'gitlab'
}

const linearTeam: LinearTeam = {
  __typename: 'Team',
  id: 'team1',
  displayName: 'Parabol',
  key: 'PAR',
  service: 'linear',
  teamId: 'team1'
}

const linearProject: LinearProject = {
  __typename: 'Project',
  id: 'proj1',
  name: 'Test project',
  teams: {nodes: [{id: 'team1', displayName: 'Parabol', name: 'Parabol', key: 'PAR'}]},
  service: 'linear',
  teamId: 'team1'
}

describe('RepoContainer', () => {
  it.each([
    ['a GitHub repo', gitHubRepo, 'ParabolInc/parabol'],
    ['a GitLab project', gitLabProject, 'acme/web'],
    ['a Linear team', linearTeam, 'Parabol'],
    ['a Linear project', linearProject, 'Parabol/Test project']
  ])('names %s the way the picker renders it', (_label, source, expected) => {
    expect(resolve(RepoContainer.name, source)).toBe(expected)
  })

  it('falls back to the bare Linear project name without a cached team', () => {
    expect(resolve(RepoContainer.name, {...linearProject, teams: {nodes: []}})).toBe('Test project')
  })

  it.each([
    ['a GitHub repo', gitHubRepo],
    ['a GitLab project', gitLabProject],
    ['a Linear team', linearTeam],
    ['a Linear project', linearProject]
  ])('keys %s on the shared codec, namespaced by service', (_label, source) => {
    const integrationRepoId = IntegrationRepoId.join(source)
    expect(resolve(RepoContainer.integrationRepoId, source)).toBe(integrationRepoId)
    expect(resolve(RepoContainer.id, source)).toBe(`${source.service}:${integrationRepoId}`)
  })

  it('composes the Linear project push id from team and project', () => {
    expect(resolve(RepoContainer.integrationRepoId, linearProject)).toBe('team1:proj1')
    expect(resolve(RepoContainer.integrationRepoId, linearTeam)).toBe('team1')
  })

  it('hands back the vendor record untouched', () => {
    expect(resolve(RepoContainer.repo, gitHubRepo)).toBe(gitHubRepo)
    expect(resolve(RepoContainer.repo, linearProject)).toBe(linearProject)
  })
})
