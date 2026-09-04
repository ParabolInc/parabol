import type {AccountProber} from './AccountProber'
import fetchGoogleWorkspaceMx from './fetchGoogleWorkspaceMx'

/**
 * Google-hosted MX proves the company runs Google Workspace, which is what Calendar rides on.
 * It says nothing about whether this individual has a calendar, hence `organization`.
 */
export const GcalWorkspaceProber: AccountProber = {
  service: 'gcal',
  subjectType: 'domain',
  matchType: 'organization',
  isEnabled: () => true,
  probe: fetchGoogleWorkspaceMx
}
