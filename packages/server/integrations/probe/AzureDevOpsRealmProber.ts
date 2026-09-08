import type {AccountProber} from './AccountProber'
import fetchMicrosoftRealm from './fetchMicrosoftRealm'

/**
 * Shares the Entra realm lookup with MSTeamsRealmProber. A tenant makes Azure DevOps reachable
 * for the account, but it does not prove the org has an ADO instance — the tenant is the account,
 * not the product.
 */
export const AzureDevOpsRealmProber: AccountProber = {
  service: 'azureDevOps',
  subjectType: 'email',
  matchType: 'account',
  isEnabled: () => true,
  probe: fetchMicrosoftRealm
}
