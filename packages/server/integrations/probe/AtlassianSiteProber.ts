import {fetchUntrusted} from '../../utils/fetchUntrusted'
import {type AccountProber, notFound, type ProbeResult} from './AccountProber'

const MAX_BODY_SIZE = 64_000
// a DNS label, which is all an Atlassian site slug can be
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,61}$/

/**
 * Atlassian Cloud sites live at {slug}.atlassian.net and the slug is conventionally the company's
 * first domain label. That makes this a guess, and a `notFound` only means the guess missed — the
 * company may still run Jira under an unrelated slug.
 *
 * The hostname is built from a user-controlled email domain, so it goes through fetchUntrusted,
 * which pins DNS and refuses private addresses.
 */
export const AtlassianSiteProber: AccountProber = {
  service: 'jira',
  subjectType: 'domain',
  matchType: 'organization',
  isEnabled: () => true,
  probe: async (domain: string): Promise<ProbeResult> => {
    const slug = domain.split('.')[0]?.toLowerCase()
    if (!slug || !VALID_SLUG.test(slug)) return notFound
    const siteUrl = `https://${slug}.atlassian.net`
    const res = await fetchUntrusted(`${siteUrl}/status`, MAX_BODY_SIZE)
    // any non-2xx, a redirect, or a blocked address comes back as null
    if (!res) return notFound
    let state: unknown
    try {
      state = JSON.parse(res.buffer.toString('utf8'))?.state
    } catch {
      // a 200 that isn't the status document is a parked page, not a site
      return notFound
    }
    if (typeof state !== 'string') return notFound
    return {verdict: 'found', evidence: {siteUrl, state}}
  }
}
