import type {AccountProber} from './AccountProber'
import probeSelfHostedHost from './probeSelfHostedHost'

interface MattermostPing {
  status?: string
  ActiveSearchBackend?: string
}

/**
 * Mattermost answers /api/v4/system/ping unauthenticated on every install, which makes it a clean
 * discriminator — unlike a bare 200 on the web root, only Mattermost returns this document.
 */
export const MattermostDnsProber: AccountProber = {
  service: 'mattermost',
  subjectType: 'domain',
  matchType: 'organization',
  isEnabled: () => true,
  probe: (domain: string) =>
    probeSelfHostedHost(domain, 'mattermost', '/api/v4/system/ping', (json) => {
      const ping = json as MattermostPing | null
      if (ping?.status !== 'OK') return null
      return {status: ping.status}
    })
}
