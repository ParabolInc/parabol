jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {JiraGQLProject} from '../../../dataloader/atlassianLoaders'
import type {AzureAccountProject} from '../../../dataloader/azureDevOpsLoaders'
import type {JiraServerProject} from '../../../dataloader/jiraServerLoaders'
import getRepoListCapability from '../getRepoListCapability'
import type {GitHubRepo, GitLabProject, LinearProject, LinearTeam} from '../RemoteRepoIntegration'

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

const jiraProject = {
  service: 'jira',
  cloudId: 'cloud1',
  key: 'WEB',
  name: 'Web',
  teamId: 't1',
  userId: 'u1'
} as unknown as JiraGQLProject

const jiraServerProject = {
  service: 'jiraServer',
  providerId: 9,
  id: '10001',
  key: 'WEB',
  name: 'Web'
} as unknown as JiraServerProject

const azureProject = {
  service: 'azureDevOps',
  instanceId: 'dev.azure.com/acme',
  projectId: 'abc123',
  id: 'abc123',
  name: 'Acme',
  url: 'https://dev.azure.com/acme/_apis/projects/abc123'
} as unknown as AzureAccountProject

describe('getRepoListCapability', () => {
  it.each([
    ['a GitHub repo', gitHubRepo, 'ParabolInc/parabol', 'ParabolInc/parabol'],
    ['a GitLab project', gitLabProject, 'acme/web', 'acme/web'],
    ['a Linear team', linearTeam, 'team1', 'Parabol'],
    ['a Linear project', linearProject, 'team1:proj1', 'Parabol/Test project']
  ])('keys and names %s from the vendor record', (_label, repo, id, name) => {
    const capability = getRepoListCapability(repo)
    expect(capability.integrationRepoId(repo)).toBe(id)
    expect(capability.name(repo)).toBe(name)
  })

  it.each([
    ['jira', jiraProject, {service: 'jira' as const, cloudId: 'cloud1', key: 'WEB'}, 'Web'],
    [
      'jiraServer',
      jiraServerProject,
      {service: 'jiraServer' as const, providerId: 9, id: '10001', key: 'WEB'},
      'Web'
    ],
    [
      'azureDevOps',
      azureProject,
      {service: 'azureDevOps' as const, instanceId: 'dev.azure.com/acme', projectId: 'abc123'},
      'Acme'
    ]
  ])(
    'keys %s exactly as IntegrationRepoId.join does, so prev-used members still match',
    (_service, repo, codecInput, name) => {
      const capability = getRepoListCapability(repo)
      expect(capability.integrationRepoId(repo)).toBe(IntegrationRepoId.join(codecInput))
      expect(capability.name(repo)).toBe(name)
    }
  )

  it('ignores the teamId and id keys that older cache members carry', () => {
    const cached = {...linearProject, teamId: 'team1'}
    expect(getRepoListCapability(cached).integrationRepoId(cached)).toBe('team1:proj1')
    const cachedTeam = {...linearTeam, teamId: 'team1'}
    expect(getRepoListCapability(cachedTeam).integrationRepoId(cachedTeam)).toBe('team1')
    const cachedGitHub = {...gitHubRepo, id: 'ParabolInc/parabol'}
    expect(getRepoListCapability(cachedGitHub).name(cachedGitHub)).toBe('ParabolInc/parabol')
  })
})
