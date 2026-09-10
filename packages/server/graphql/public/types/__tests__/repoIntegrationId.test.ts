jest.mock('../../rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import AzureDevOpsRemoteProject from '../AzureDevOpsRemoteProject'
import JiraRemoteProject from '../JiraRemoteProject'
import JiraServerRemoteProject from '../JiraServerRemoteProject'
import RepoContainer from '../RepoContainer'

const resolve = (resolver: unknown, source: unknown) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(source)
}

describe('RepoIntegration.integrationRepoId', () => {
  it('matches IntegrationRepoId.join for every cached repo shape', () => {
    const github = {
      service: 'github' as const,
      nameWithOwner: 'ParabolInc/parabol',
      hasIssuesEnabled: true,
      updatedAt: new Date('2026-01-01'),
      viewerCanAdminister: false
    }
    expect(resolve(RepoContainer.integrationRepoId, github)).toBe('ParabolInc/parabol')

    const gitlab = {
      __typename: 'Project' as const,
      service: 'gitlab' as const,
      fullPath: 'acme/web',
      id: 'gid://gitlab/Project/1'
    }
    expect(resolve(RepoContainer.integrationRepoId, gitlab)).toBe('acme/web')

    const jiraServer = {service: 'jiraServer' as const, id: '10001', providerId: 9, key: 'WEB'}
    expect(resolve(JiraServerRemoteProject.integrationRepoId, jiraServer)).toBe(
      IntegrationRepoId.join(jiraServer)
    )

    const azure = {id: 'abc123', url: 'https://dev.azure.com/acme/_apis/projects/abc123'}
    expect(resolve(AzureDevOpsRemoteProject.integrationRepoId, azure)).toBe(
      IntegrationRepoId.join({
        service: 'azureDevOps',
        instanceId: 'dev.azure.com/acme',
        projectId: 'abc123'
      })
    )

    const jira = {cloudId: 'cloud1', key: 'WEB'}
    expect(resolve(JiraRemoteProject.integrationRepoId, jira)).toBe(
      IntegrationRepoId.join({service: 'jira', cloudId: 'cloud1', key: 'WEB'})
    )
  })

  it('joins a Linear team on its own id', () => {
    expect(
      resolve(RepoContainer.integrationRepoId, {
        __typename: 'Team',
        service: 'linear',
        id: 'team1',
        displayName: 'Parabol',
        key: 'PAR'
      })
    ).toBe('team1')
  })
})
