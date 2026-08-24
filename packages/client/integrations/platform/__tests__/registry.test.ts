jest.mock('../../../utils/AtlassianClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn()}
}))
jest.mock('../../../utils/JiraServerClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn()}
}))
jest.mock('../../../utils/GitHubClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn()}
}))
jest.mock('../../../utils/GitLabClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn()}
}))
jest.mock('../../../utils/AzureDevOpsClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn()}
}))
jest.mock('../../../utils/LinearClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn()}
}))

import type {IssueParts} from '../../../shared/integrations/IntegrationMeta'
import {clientIntegrations, getClientIntegration} from '../registry'

const SAMPLE_ISSUE_PARTS: Record<string, IssueParts> = {
  azureDevOps: {instanceId: 'dev.azure.com/acme', projectKey: 'WebApp', issueKey: '42'},
  github: {nameWithOwner: 'ParabolInc/parabol', issueNumber: 123},
  gitlab: {providerId: '7', gid: 'gid://gitlab/Issue/321'},
  jira: {cloudId: 'cloud-123', issueKey: 'WEB-42'},
  jiraServer: {providerId: 9, repositoryId: '10001', issueId: '10042'},
  linear: {repoId: 'team1:proj1', issueId: 'a1b2c3'}
}

describe('clientIntegrations registry', () => {
  it('registers exactly the six task services', () => {
    expect(Object.keys(clientIntegrations).sort()).toEqual([
      'azureDevOps',
      'github',
      'gitlab',
      'jira',
      'jiraServer',
      'linear'
    ])
  })

  it.each(Object.entries(clientIntegrations))('%s: service matches key', (key, def) => {
    expect(def.service).toBe(key)
  })

  it.each(Object.entries(clientIntegrations))('%s: has title and description', (_key, def) => {
    expect(def.title.length).toBeGreaterThan(0)
    expect(def.description.length).toBeGreaterThan(0)
  })

  it.each(Object.entries(clientIntegrations))('%s: issue codec round-trips', (key, def) => {
    const id = def.ids.joinIssue(SAMPLE_ISSUE_PARTS[key]!)
    expect(def.ids.joinIssue(def.ids.splitIssue(id))).toBe(id)
  })

  it('returns null for an unknown service', () => {
    expect(getClientIntegration('asana')).toBeNull()
  })

  it('returns null for an inherited prototype key', () => {
    expect(getClientIntegration('toString')).toBeNull()
  })
})
