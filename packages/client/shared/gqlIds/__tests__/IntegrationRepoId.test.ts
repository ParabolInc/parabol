import IntegrationRepoId from '../IntegrationRepoId'

describe('IntegrationRepoId.join', () => {
  it('joins a Linear team on its own id, not id:id', () => {
    expect(IntegrationRepoId.join({service: 'linear', id: 'team1', teamId: 'team1'})).toBe('team1')
  })

  it('joins a Linear project on teamId:id', () => {
    expect(IntegrationRepoId.join({service: 'linear', id: 'proj1', teamId: 'team1'})).toBe(
      'team1:proj1'
    )
  })

  it('joins a GitHub repo on nameWithOwner', () => {
    expect(IntegrationRepoId.join({service: 'github', nameWithOwner: 'ParabolInc/parabol'})).toBe(
      'ParabolInc/parabol'
    )
  })

  it('joins a GitLab project on fullPath', () => {
    expect(IntegrationRepoId.join({service: 'gitlab', fullPath: 'acme/web'})).toBe('acme/web')
  })

  it('joins a Jira project on cloudId:key', () => {
    expect(IntegrationRepoId.join({service: 'jira', cloudId: 'cloud1', key: 'WEB'})).toBe(
      'cloud1:WEB'
    )
  })

  it('joins a Jira Server project on jiraServer:providerId:id:key', () => {
    expect(
      IntegrationRepoId.join({service: 'jiraServer', id: '10001', providerId: 9, key: 'WEB'})
    ).toBe('jiraServer:9:10001:WEB')
  })

  it('joins an Azure DevOps project on instanceId:projectId', () => {
    expect(
      IntegrationRepoId.join({
        service: 'azureDevOps',
        instanceId: 'dev.azure.com/acme',
        projectId: 'abc123'
      })
    ).toBe('dev.azure.com/acme:abc123')
  })
})
