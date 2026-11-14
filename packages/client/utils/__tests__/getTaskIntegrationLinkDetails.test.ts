import getTaskIntegrationLinkDetails from '../getTaskIntegrationLinkDetails'

const jira = (status: string | null) => ({
  __typename: 'JiraIssue',
  id: 'cloud:COPPER-142',
  TaskIntegrationLinkIntegrationJira: {
    issueKey: 'COPPER-142',
    projectKey: 'COPPER',
    cloudName: 'copper',
    jiraStatus: status ? {name: status} : null
  }
})

const gitlab = (state: 'opened' | 'closed' | 'locked' | 'all') => ({
  __typename: '_xGitLabIssue',
  id: 'gitlab:1',
  TaskIntegrationLinkIntegrationGitLab: {
    iid: '7',
    webPath: '/copper/deploy/-/issues/7',
    webUrl: 'https://gitlab.com/copper/deploy/-/issues/7',
    gitlabState: state
  }
})

describe('getTaskIntegrationLinkDetails', () => {
  it('shows the status Jira gives, whatever it is called', () => {
    expect(getTaskIntegrationLinkDetails(jira('In Review'))).toMatchObject({
      href: 'https://copper.atlassian.net/browse/COPPER-142',
      label: 'Issue #COPPER-142',
      service: 'jira',
      status: 'In Review'
    })
  })

  it('has no status when the issue came back without one', () => {
    expect(getTaskIntegrationLinkDetails(jira(null))?.status).toBeNull()
  })

  it('words GitLab states for people', () => {
    expect(getTaskIntegrationLinkDetails(gitlab('opened'))?.status).toBe('Open')
    expect(getTaskIntegrationLinkDetails(gitlab('closed'))?.status).toBe('Closed')
    expect(getTaskIntegrationLinkDetails(gitlab('all'))?.status).toBeNull()
  })

  it('names the service for each provider', () => {
    const azure = {
      __typename: 'AzureDevOpsWorkItem',
      id: 'azure:1',
      TaskIntegrationLinkIntegrationAzure: {
        id: 'azure:1',
        workItemKey: '42',
        azureProject: {organization: 'copper', name: 'Deploy'},
        type: 'Bug',
        azureState: 'Resolved',
        url: 'https://dev.azure.com/copper/Deploy/_workitems/edit/42'
      }
    }
    expect(getTaskIntegrationLinkDetails(azure)).toMatchObject({
      label: 'Bug #copper:42',
      service: 'azureDevOps',
      status: 'Resolved'
    })
  })
})
