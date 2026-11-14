jest.mock('../../../../integrations/platform/registry', () => {
  const popularity = [
    'jira',
    'jiraServer',
    'github',
    'linear',
    'gitlab',
    'azureDevOps',
    'clickup',
    'gcal'
  ]
  return {
    listClientIntegrationServices: (services: {service: string}[]) =>
      popularity.flatMap((service) => {
        const integrationService = services.find((candidate) => candidate.service === service)
        return integrationService ? [{integrationService}] : []
      })
  }
})

import listInspirationSources from '../listInspirationSources'

describe('listInspirationSources', () => {
  it('is only Parabol before the team member loads', () => {
    expect(listInspirationSources(null)).toEqual([{service: 'PARABOL', isConnected: true}])
  })

  it('offers available services that list issues, in popularity order', () => {
    const sources = listInspirationSources([
      {service: 'gcal', isAvailable: true, isConnected: false},
      {service: 'github', isAvailable: true, isConnected: true},
      {service: 'linear', isAvailable: false, isConnected: false},
      {service: 'gitlab', isAvailable: true, isConnected: true},
      {service: 'clickup', isAvailable: true, isConnected: true},
      {service: 'jira', isAvailable: true, isConnected: false}
    ])
    expect(sources).toEqual([
      {service: 'PARABOL', isConnected: true},
      {service: 'jira', isConnected: false},
      {service: 'github', isConnected: true},
      {service: 'clickup', isConnected: true},
      {service: 'gcal', isConnected: false}
    ])
  })
})
