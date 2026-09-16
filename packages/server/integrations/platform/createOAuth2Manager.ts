import type {TIntegrationProvider} from '../../postgres/types/IntegrationProvider'
import GcalOAuth2Manager from '../gcal/GcalOAuth2Manager'
import GitHubOAuth2Manager from '../github/GitHubOAuth2Manager'
import GitLabOAuth2Manager from '../gitlab/GitLabOAuth2Manager'
import GmeetOAuth2Manager from '../gmeet/GmeetOAuth2Manager'
import JiraOAuth2Manager from '../jira/JiraOAuth2Manager'
import LinearManager from '../linear/LinearManager'
import type OAuth2Manager from '../OAuth2Manager'
import ZoomOAuth2Manager from '../zoom/ZoomOAuth2Manager'

type OAuth2ManagerConstructor = new (
  clientId: string,
  clientSecret: string,
  serverBaseUrl: string
) => OAuth2Manager

const OAUTH2_MANAGERS: Partial<Record<TIntegrationProvider['service'], OAuth2ManagerConstructor>> =
  {
    gcal: GcalOAuth2Manager,
    github: GitHubOAuth2Manager,
    gitlab: GitLabOAuth2Manager,
    gmeet: GmeetOAuth2Manager,
    jira: JiraOAuth2Manager,
    linear: LinearManager,
    zoom: ZoomOAuth2Manager
  }

/** The token-exchange client for an OAuth2 provider. Null for other strategies and for azureDevOps, whose PKCE flow lives on AzureDevOpsServerManager */
const createOAuth2Manager = (provider: TIntegrationProvider): OAuth2Manager | null => {
  if (provider.authStrategy !== 'oauth2') return null
  const Manager = OAUTH2_MANAGERS[provider.service]
  if (!Manager) return null
  const {clientId, clientSecret, serverBaseUrl} = provider
  return new Manager(clientId, clientSecret, serverBaseUrl)
}

export default createOAuth2Manager
