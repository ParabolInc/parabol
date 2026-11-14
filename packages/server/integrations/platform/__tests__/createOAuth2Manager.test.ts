import type {TIntegrationProvider} from '../../../postgres/types/IntegrationProvider'
import GcalOAuth2Manager from '../../gcal/GcalOAuth2Manager'
import GitHubOAuth2Manager from '../../github/GitHubOAuth2Manager'
import GitLabOAuth2Manager from '../../gitlab/GitLabOAuth2Manager'
import GmeetOAuth2Manager from '../../gmeet/GmeetOAuth2Manager'
import JiraOAuth2Manager from '../../jira/JiraOAuth2Manager'
import LinearManager from '../../linear/LinearManager'
import ZoomOAuth2Manager from '../../zoom/ZoomOAuth2Manager'
import createOAuth2Manager from '../createOAuth2Manager'

const oauth2 = (service: TIntegrationProvider['service']) =>
  ({
    authStrategy: 'oauth2',
    service,
    clientId: 'client',
    clientSecret: 'secret',
    serverBaseUrl: 'https://example.com',
    isActive: true
  }) as TIntegrationProvider

describe('createOAuth2Manager', () => {
  it.each([
    ['gcal', GcalOAuth2Manager],
    ['github', GitHubOAuth2Manager],
    ['gitlab', GitLabOAuth2Manager],
    ['gmeet', GmeetOAuth2Manager],
    ['jira', JiraOAuth2Manager],
    ['linear', LinearManager],
    ['zoom', ZoomOAuth2Manager]
  ] as const)('builds the %s manager from the provider credentials', (service, Manager) => {
    expect(createOAuth2Manager(oauth2(service))).toBeInstanceOf(Manager)
  })

  it('is null for azureDevOps, whose PKCE exchange lives on AzureDevOpsServerManager', () => {
    expect(createOAuth2Manager(oauth2('azureDevOps'))).toBeNull()
  })

  it('is null for non-oauth2 strategies', () => {
    expect(
      createOAuth2Manager({
        authStrategy: 'oauth1',
        service: 'jiraServer',
        consumerKey: 'k',
        consumerSecret: 's',
        serverBaseUrl: 'https://jira.example.com',
        isActive: true
      } as TIntegrationProvider)
    ).toBeNull()
  })
})
