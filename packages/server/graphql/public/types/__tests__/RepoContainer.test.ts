jest.mock('../../rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

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
  hasIssuesEnabled: true,
  nameWithOwner: 'ParabolInc/parabol',
  updatedAt: new Date('2026-01-01'),
  viewerCanAdminister: false,
  service: 'github'
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
  service: 'linear'
}

const linearProject: LinearProject = {
  __typename: 'Project',
  id: 'proj1',
  name: 'Test project',
  teams: {nodes: [{id: 'team1', displayName: 'Parabol', name: 'Parabol', key: 'PAR'}]},
  service: 'linear'
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

  it.each([
    ['a GitHub repo', gitHubRepo, 'ParabolInc/parabol'],
    ['a GitLab project', gitLabProject, 'acme/web'],
    ['a Linear team', linearTeam, 'team1'],
    ['a Linear project', linearProject, 'team1:proj1']
  ])('keys %s on its push id, namespaced by service', (_label, source, integrationRepoId) => {
    expect(resolve(RepoContainer.integrationRepoId, source)).toBe(integrationRepoId)
    expect(resolve(RepoContainer.id, source)).toBe(`${source.service}:${integrationRepoId}`)
  })

  it('still keys cache members written with the old teamId and id fields', () => {
    expect(resolve(RepoContainer.integrationRepoId, {...linearProject, teamId: 'team1'})).toBe(
      'team1:proj1'
    )
    expect(resolve(RepoContainer.integrationRepoId, {...linearTeam, teamId: 'team1'})).toBe('team1')
    expect(resolve(RepoContainer.id, {...gitHubRepo, id: 'ParabolInc/parabol'})).toBe(
      'github:ParabolInc/parabol'
    )
  })
})
