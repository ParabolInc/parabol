import type {AccountProber} from './AccountProber'
import {AtlassianSiteProber} from './AtlassianSiteProber'
import {AzureDevOpsRealmProber} from './AzureDevOpsRealmProber'
import {GcalWorkspaceProber} from './GcalWorkspaceProber'
import {GitHubEmailProber} from './GitHubEmailProber'
import {GitLabEmailProber} from './GitLabEmailProber'
import {GitLabSelfHostedDnsProber} from './GitLabSelfHostedDnsProber'
import {GmeetWorkspaceProber} from './GmeetWorkspaceProber'
import {JiraServerDnsProber} from './JiraServerDnsProber'
import {MattermostDnsProber} from './MattermostDnsProber'
import {MSTeamsRealmProber} from './MSTeamsRealmProber'

/**
 * Every lookup we can perform. A service may appear more than once when it can be detected two
 * ways — gitlab has both an email lookup on gitlab.com and a domain lookup for self-hosted — and
 * each entry writes its own row, keyed by its own subject.
 *
 * Two services are deliberately absent:
 * - `linear` exposes no lookup that works from outside a workspace, so there is nothing to ask.
 * - `slack` is not a member of IntegrationProviderServiceEnum (its auth predates that table), and
 *   the only lookup available — users.lookupByEmail against a workspace we already hold a bot
 *   token for — can only answer for teams that have already connected Slack, which is exactly
 *   the population that needs the suggestion least.
 */
export const proberRegistry: AccountProber[] = [
  GitHubEmailProber,
  GitLabEmailProber,
  MSTeamsRealmProber,
  AzureDevOpsRealmProber,
  AtlassianSiteProber,
  GcalWorkspaceProber,
  GmeetWorkspaceProber,
  JiraServerDnsProber,
  MattermostDnsProber,
  GitLabSelfHostedDnsProber
]
