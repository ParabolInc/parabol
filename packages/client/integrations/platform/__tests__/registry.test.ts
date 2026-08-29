jest.mock('../../../utils/AtlassianClientManager', () => ({
  __esModule: true,
  default: {openOAuth: jest.fn(), JIRA_SCOPE: ['read:jira-work']}
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

import type Atmosphere from '../../../Atmosphere'
import type {MenuMutationProps} from '../../../hooks/useMutationProps'
import type {IssueParts} from '../../../shared/integrations/IntegrationMeta'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import GitLabClientManager from '../../../utils/GitLabClientManager'
import JiraServerClientManager from '../../../utils/JiraServerClientManager'
import LinearClientManager from '../../../utils/LinearClientManager'
import {clientIntegrations, getClientIntegration, isRegisteredClientIntegration} from '../registry'

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

const atmosphere = {} as Atmosphere
const mutationProps = {} as MenuMutationProps

describe('connect with an interface-shaped provider ref', () => {
  beforeEach(() => jest.clearAllMocks())

  it('jira forwards heldScopes so a re-consent keeps Confluence scopes', () => {
    clientIntegrations.jira.connect(atmosphere, {
      teamId: 'team1',
      mutationProps,
      provider: {id: 'p1', clientId: 'c1', serverBaseUrl: null, tenantId: null},
      heldScopes: ['read:confluence-space.summary']
    })
    expect(AtlassianClientManager.openOAuth).toHaveBeenCalledWith(
      atmosphere,
      'team1',
      {id: 'p1', clientId: 'c1'},
      mutationProps,
      ['read:jira-work'],
      ['read:confluence-space.summary']
    )
  })

  it('OAuth2 services do nothing without the fields their manager needs', () => {
    const noClient = {id: 'p1', clientId: null, serverBaseUrl: 'https://x', tenantId: null}
    const noBaseUrl = {id: 'p1', clientId: 'c1', serverBaseUrl: null, tenantId: null}
    clientIntegrations.jira.connect(atmosphere, {
      teamId: 'team1',
      mutationProps,
      provider: noClient
    })
    clientIntegrations.gitlab.connect(atmosphere, {
      teamId: 'team1',
      mutationProps,
      provider: noBaseUrl
    })
    clientIntegrations.linear.connect(atmosphere, {
      teamId: 'team1',
      mutationProps,
      provider: noBaseUrl
    })
    expect(AtlassianClientManager.openOAuth).not.toHaveBeenCalled()
    expect(GitLabClientManager.openOAuth).not.toHaveBeenCalled()
    expect(LinearClientManager.openOAuth).not.toHaveBeenCalled()
  })

  it('jiraServer (OAuth1) connects with only the provider id', () => {
    clientIntegrations.jiraServer.connect(atmosphere, {
      teamId: 'team1',
      mutationProps,
      provider: {id: 'p9', clientId: null, serverBaseUrl: 'https://jira.acme.com', tenantId: null}
    })
    expect(JiraServerClientManager.openOAuth).toHaveBeenCalledWith(
      atmosphere,
      'p9',
      'team1',
      mutationProps
    )
  })

  it('exposes a type guard over the registry keys', () => {
    expect(isRegisteredClientIntegration('linear')).toBe(true)
    expect(isRegisteredClientIntegration('gcal')).toBe(false)
    expect(isRegisteredClientIntegration('toString')).toBe(false)
  })
})
