import type {AccountProber} from './AccountProber'
import probeSelfHostedHost from './probeSelfHostedHost'

interface JiraServerInfo {
  version?: string
  baseUrl?: string
  serverTitle?: string
}

/**
 * Jira Data Center serves /rest/api/2/serverInfo unauthenticated on a default install, so a valid
 * response under jira.{domain} is solid evidence the company self-hosts Jira. Installs that moved
 * off the conventional hostname or locked the endpoint down read as notFound.
 */
export const JiraServerDnsProber: AccountProber = {
  service: 'jiraServer',
  subjectType: 'domain',
  matchType: 'organization',
  isEnabled: () => true,
  probe: (domain: string) =>
    probeSelfHostedHost(domain, 'jira', '/rest/api/2/serverInfo', (json) => {
      const info = json as JiraServerInfo | null
      if (!info?.version || !info.baseUrl) return null
      return {version: info.version, serverTitle: info.serverTitle}
    })
}
