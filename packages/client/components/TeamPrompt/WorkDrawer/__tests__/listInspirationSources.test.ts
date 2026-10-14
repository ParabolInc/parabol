jest.mock('../../../../integrations/platform/registry', () => {
  const popularity = ['jira', 'jiraServer', 'github', 'linear', 'gitlab', 'azureDevOps', 'gcal']
  return {
    compareClientIntegrationPopularity: (a: string, b: string) =>
      popularity.indexOf(a) - popularity.indexOf(b)
  }
})

import listInspirationSources from '../listInspirationSources'

describe('listInspirationSources', () => {
  it('is only Parabol before the team member loads', () => {
    expect(listInspirationSources(null)).toEqual([{service: 'PARABOL', isConnected: true}])
  })

  it('offers available services that list issues, in popularity order', () => {
    const sources = listInspirationSources([
      {service: 'gcal', isAvailable: true, isConnected: false, capabilities: ['issueList']},
      {
        service: 'github',
        isAvailable: true,
        isConnected: true,
        capabilities: ['issueCreate', 'issueList']
      },
      {service: 'linear', isAvailable: false, isConnected: false, capabilities: ['issueList']},
      {service: 'gitlab', isAvailable: true, isConnected: true, capabilities: ['issueCreate']},
      {service: 'jira', isAvailable: true, isConnected: false, capabilities: ['issueList']}
    ])
    expect(sources).toEqual([
      {service: 'PARABOL', isConnected: true},
      {service: 'jira', isConnected: false},
      {service: 'github', isConnected: true},
      {service: 'gcal', isConnected: false}
    ])
  })
})
