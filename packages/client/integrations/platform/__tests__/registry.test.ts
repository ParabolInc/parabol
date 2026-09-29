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

import type {IntegrationProviderServiceEnum} from '../../../__generated__/CreateTaskIntegrationMutation.graphql'
import type Atmosphere from '../../../Atmosphere'
import type {MenuMutationProps} from '../../../hooks/useMutationProps'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import GitLabClientManager from '../../../utils/GitLabClientManager'
import JiraServerClientManager from '../../../utils/JiraServerClientManager'
import LinearClientManager from '../../../utils/LinearClientManager'
import {clientIntegrations, getClientIntegration, isRegisteredClientIntegration} from '../registry'

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

  it('every registered integration ships a lazy scope-tab panel', () => {
    Object.values(clientIntegrations).forEach((definition) => {
      const Panel = definition.capabilities.scoping?.Panel
      expect(Panel).toBeDefined()
      expect(String(Panel?.$$typeof)).toBe('Symbol(react.lazy)')
    })
  })

  it('looks up a definition by service', () => {
    expect(getClientIntegration('jira')).toBe(clientIntegrations.jira)
  })

  it('the two Jira services label a saved project filter by its project key', () => {
    expect(clientIntegrations.jira.capabilities.scoping?.projectFilterLabel?.('cloud1:WEB')).toBe(
      'WEB'
    )
    expect(
      clientIntegrations.jiraServer.capabilities.scoping?.projectFilterLabel?.(
        'jiraServer:9:10001:WEB'
      )
    ).toBe('WEB')
  })

  it('only Jira Data Center sets contactUs, the slot both surfaces advertise on', () => {
    const advertised = Object.entries(clientIntegrations)
      .filter(([, definition]) => definition.contactUs)
      .map(([key]) => key)
    expect(advertised).toEqual(['jiraServer'])
    expect(clientIntegrations.jiraServer.contactUs).toEqual({
      url: 'https://www.parabol.co/integrations/jira-server',
      clickEvent: 'Clicked Jira Server Request Button'
    })
  })

  it('every registered integration ships its own settings-row logo asset', () => {
    const sources = Object.values(clientIntegrations).map((definition) => definition.logo.src)
    sources.forEach((src) => expect(src).toBeTruthy())
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('only GitHub carries a dark-theme logo, whose mark is otherwise invisible', () => {
    const withDarkSrc = Object.entries(clientIntegrations)
      .filter(([, definition]) => definition.logo.darkSrc)
      .map(([key]) => key)
    expect(withDarkSrc).toEqual(['github'])
  })

  it('only Jira Cloud explains what a disconnect takes with it', () => {
    const withSubline = Object.entries(clientIntegrations)
      .filter(([, definition]) => definition.capabilities.settings?.getDisconnectSubline)
      .map(([key]) => key)
    expect(withSubline).toEqual(['jira'])
    const getDisconnectSubline = clientIntegrations.jira.capabilities.settings?.getDisconnectSubline
    const jiraScopes = ['read:jira-user', 'read:jira-work', 'write:jira-work', 'offline_access']
    const confluenceScopes = [
      'read:page:confluence',
      'write:page:confluence',
      'read:space:confluence',
      'write:attachment:confluence',
      'read:content-details:confluence'
    ]
    expect(getDisconnectSubline?.(jiraScopes)).toBe('Disconnects Jira')
    expect(getDisconnectSubline?.(confluenceScopes)).toBe('Disconnects Confluence')
    expect(getDisconnectSubline?.([...jiraScopes, ...confluenceScopes])).toBe(
      'Disconnects Jira and Confluence'
    )
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
    expect(isRegisteredClientIntegration('toString' as IntegrationProviderServiceEnum)).toBe(false)
  })
})
