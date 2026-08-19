jest.mock('../../TaskIntegrationManagerFactory', () => ({
  __esModule: true,
  default: {initManager: jest.fn()}
}))

import {getServerIntegration, serverIntegrations} from '../registry'
import type {IntegrationCapabilityKey} from '../ServerIntegrationDefinition'

const KNOWN_CAPABILITIES: IntegrationCapabilityKey[] = [
  'issueCreate',
  'issueRead',
  'issueSearch',
  'repoList',
  'estimatePush',
  'issueList'
]

describe('serverIntegrations registry', () => {
  const entries = Object.entries(serverIntegrations)

  it('registers exactly the six task services', () => {
    expect(Object.keys(serverIntegrations).sort()).toEqual([
      'azureDevOps',
      'github',
      'gitlab',
      'jira',
      'jiraServer',
      'linear'
    ])
  })

  it.each(entries)('%s: service field matches its registry key', (key, def) => {
    expect(def.service).toBe(key)
  })

  it.each(entries)('%s: has a non-empty title', (_key, def) => {
    expect(def.title.length).toBeGreaterThan(0)
  })

  it.each(entries)('%s: declares only known capability keys', (_key, def) => {
    for (const capability of def.getCapabilityKeys()) {
      expect(KNOWN_CAPABILITIES).toContain(capability)
    }
  })

  it.each(entries)('%s: declares issueCreate', (_key, def) => {
    expect(def.capabilities.issueCreate).toBeDefined()
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
