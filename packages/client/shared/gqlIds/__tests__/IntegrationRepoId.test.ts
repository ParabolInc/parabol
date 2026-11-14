import IntegrationRepoId from '../IntegrationRepoId'

describe('IntegrationRepoId.join', () => {
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
