import type {AccountProber} from './AccountProber'
import fetchGoogleWorkspaceMx from './fetchGoogleWorkspaceMx'

/**
 * Shares the MX lookup with GcalWorkspaceProber — Meet ships with the same Workspace tenancy.
 */
export const GmeetWorkspaceProber: AccountProber = {
  service: 'gmeet',
  subjectType: 'domain',
  matchType: 'organization',
  isEnabled: () => true,
  probe: fetchGoogleWorkspaceMx
}
