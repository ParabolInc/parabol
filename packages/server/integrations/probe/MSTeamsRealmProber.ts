import type {AccountProber} from './AccountProber'
import fetchMicrosoftRealm from './fetchMicrosoftRealm'

/**
 * A Managed/Federated realm proves the address belongs to a Microsoft Entra tenant, which is the
 * account Teams runs on. Unauthenticated and stable, so this is the highest-recall email lookup
 * of the set.
 */
export const MSTeamsRealmProber: AccountProber = {
  service: 'msTeams',
  subjectType: 'email',
  matchType: 'account',
  isEnabled: () => true,
  probe: fetchMicrosoftRealm
}
