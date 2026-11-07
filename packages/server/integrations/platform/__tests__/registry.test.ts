jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import {getServerIntegration, serverIntegrations} from '../registry'

describe('serverIntegrations registry', () => {
  it('gcal only lists events for the drawers', () => {
    expect(serverIntegrations.gcal.getCapabilityKeys()).toEqual(['issueList'])
  })

  it('the drawer sources are exactly the services that implement issueList', () => {
    const listing = Object.entries(serverIntegrations)
      .filter(([, def]) => def.getCapabilityKeys().includes('issueList'))
      .map(([key]) => key)
      .sort()
    expect(listing).toEqual(['azureDevOps', 'gcal', 'github', 'jira', 'linear'])
  })

  it('getServerIntegration returns null for an unknown service', () => {
    expect(getServerIntegration('asana')).toBeNull()
  })

  it('getServerIntegration resolves a known service', () => {
    expect(getServerIntegration('jira')).toBe(serverIntegrations.jira)
  })

  it('getServerIntegration returns null for an inherited prototype key', () => {
    expect(getServerIntegration('toString')).toBeNull()
  })
})
