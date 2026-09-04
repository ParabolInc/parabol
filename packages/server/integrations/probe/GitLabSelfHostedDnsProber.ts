import type {AccountProber} from './AccountProber'
import probeSelfHostedHost from './probeSelfHostedHost'

interface GitLabManifest {
  name?: string
  short_name?: string
}

/**
 * Covers self-hosted GitLab, which GitLabEmailProber cannot see. Recall is the weakest of the set:
 * GitLab has no unauthenticated API that both identifies the product and returns 200, so this
 * relies on /-/manifest.json, which private instances redirect to a sign-in page. A notFound here
 * carries almost no information.
 */
export const GitLabSelfHostedDnsProber: AccountProber = {
  service: 'gitlab',
  subjectType: 'domain',
  matchType: 'organization',
  isEnabled: () => true,
  probe: (domain: string) =>
    probeSelfHostedHost(domain, 'gitlab', '/-/manifest.json', (json) => {
      const manifest = json as GitLabManifest | null
      const name = manifest?.name ?? manifest?.short_name
      if (!name?.toLowerCase().includes('gitlab')) return null
      return {name}
    })
}
