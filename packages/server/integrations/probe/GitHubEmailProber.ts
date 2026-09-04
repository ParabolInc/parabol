import {type AccountProber, inconclusive, notFound, type ProbeResult} from './AccountProber'
import probeFetchJson from './probeFetchJson'

interface GitHubUserSearchResponse {
  total_count?: number
  items?: {login?: string; id?: number; html_url?: string}[]
}

/**
 * `in:email` only matches accounts whose owner made their email public, so a `notFound` here is
 * weak evidence — most GitHub users hide their address. A `found` is strong.
 */
export const GitHubEmailProber: AccountProber = {
  service: 'github',
  subjectType: 'email',
  matchType: 'account',
  isEnabled: () => !!process.env.GITHUB_LOOKUP_TOKEN,
  // the search API allows 30 requests/min for an authenticated token
  minIntervalMs: 2000,
  probe: async (email: string): Promise<ProbeResult> => {
    const token = process.env.GITHUB_LOOKUP_TOKEN
    if (!token) return inconclusive('no GITHUB_LOOKUP_TOKEN configured')
    const q = encodeURIComponent(`${email} in:email`)
    const res = await probeFetchJson(`https://api.github.com/search/users?q=${q}&per_page=1`, {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    })
    if (!res) return inconclusive('request failed')
    // 403 is how the search API reports a spent rate limit, so it is not a negative result
    if (res.status === 403 || res.status === 429) return inconclusive('rate limited')
    if (res.status !== 200) return inconclusive(`http ${res.status}`)
    const body = res.json as GitHubUserSearchResponse | null
    const match = body?.items?.[0]
    if (!body?.total_count || !match?.login) return notFound
    return {
      verdict: 'found',
      evidence: {login: match.login, profileUrl: match.html_url}
    }
  }
}
