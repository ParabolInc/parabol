import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import _xGitHubRepository from '../_xGitHubRepository'
import _xGitLabProject from '../_xGitLabProject'
import _xLinearProject from '../_xLinearProject'
import _xLinearTeam from '../_xLinearTeam'
import AzureDevOpsRemoteProject from '../AzureDevOpsRemoteProject'
import JiraRemoteProject from '../JiraRemoteProject'
import JiraServerRemoteProject from '../JiraServerRemoteProject'

const resolve = (resolver: unknown, source: unknown) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(source)
}

describe('RepoIntegration.integrationRepoId', () => {
  it('matches IntegrationRepoId.join for every cached repo shape', () => {
    const github = {service: 'github' as const, nameWithOwner: 'ParabolInc/parabol', id: 'R_1'}
    expect(resolve(_xGitHubRepository.integrationRepoId, github)).toBe(
      IntegrationRepoId.join(github)
    )

    const gitlab = {service: 'gitlab' as const, fullPath: 'acme/web', id: 'gid://gitlab/Project/1'}
    expect(resolve(_xGitLabProject.integrationRepoId, gitlab)).toBe(IntegrationRepoId.join(gitlab))

    const linearProject = {service: 'linear' as const, id: 'proj1', teamId: 'team1'}
    expect(resolve(_xLinearProject.integrationRepoId, linearProject)).toBe(
      IntegrationRepoId.join(linearProject)
    )

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

  it('joins a Linear team on its own id and a project from its first team when teamId is absent', () => {
    expect(resolve(_xLinearTeam.integrationRepoId, {id: 'team1'})).toBe(
      IntegrationRepoId.join({service: 'linear', id: 'team1', teamId: 'team1'})
    )
    expect(
      resolve(_xLinearProject.integrationRepoId, {id: 'proj1', teams: {nodes: [{id: 'team1'}]}})
    ).toBe('team1:proj1')
  })

  it('throws when a stitched object lacks the parts the push id needs', () => {
    expect(() => resolve(_xGitHubRepository.integrationRepoId, {id: 'R_1'})).toThrow()
    expect(() =>
      resolve(_xGitLabProject.integrationRepoId, {id: 'gid://gitlab/Project/1'})
    ).toThrow()
    expect(() => resolve(_xLinearProject.integrationRepoId, {id: 'proj1'})).toThrow()
  })
})
