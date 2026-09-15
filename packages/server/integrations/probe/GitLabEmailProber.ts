import {type AccountProber, inconclusive, notFound, type ProbeResult} from './AccountProber'
import probeFetchJson from './probeFetchJson'

interface GitLabUser {
  username?: string
  id?: number
  web_url?: string
}

/**
 * GitLab only resolves `search` against a public email unless the token belongs to an admin, so
 * recall on gitlab.com is low for the same reason as GitHub. Self-hosted GitLab is not covered
 * here — see SelfHostedDnsProber.
 */
export const GitLabEmailProber: AccountProber = {
  service: 'gitlab',
  subjectType: 'email',
  matchType: 'account',
  isEnabled: () => !!process.env.GITLAB_LOOKUP_TOKEN,
  probe: async (email: string): Promise<ProbeResult> => {
    const token = process.env.GITLAB_LOOKUP_TOKEN
    if (!token) return inconclusive('no GITLAB_LOOKUP_TOKEN configured')
    const baseUrl = process.env.GITLAB_LOOKUP_SERVER_URL || 'https://gitlab.com'
    const res = await probeFetchJson(
      `${baseUrl}/api/v4/users?search=${encodeURIComponent(email)}&per_page=1`,
      {'PRIVATE-TOKEN': token}
    )
    if (!res) return inconclusive('request failed')
    if (res.status === 429) return inconclusive('rate limited')
    if (res.status !== 200) return inconclusive(`http ${res.status}`)
    const users = res.json as GitLabUser[] | null
    const match = Array.isArray(users) ? users[0] : undefined
    if (!match?.username) return notFound
    return {
      verdict: 'found',
      evidence: {username: match.username, profileUrl: match.web_url}
    }
  }
}
