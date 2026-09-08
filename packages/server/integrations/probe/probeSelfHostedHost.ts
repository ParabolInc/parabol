import {fetchUntrusted} from '../../utils/fetchUntrusted'
import {notFound, type ProbeEvidence, type ProbeResult} from './AccountProber'

const MAX_BODY_SIZE = 256_000
const VALID_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/

/**
 * Check whether a conventionally-named self-hosted service answers under a company's domain,
 * e.g. jira.acme.com.
 *
 * The hostname is assembled from a user-controlled email domain — anyone can sign up as
 * someone@internal.corp — so the request MUST go through fetchUntrusted. That pins DNS to the
 * addresses it validated (closing the rebind window), refuses private and loopback addresses, and
 * declines to follow redirects. Never swap this for a bare fetch to read a status code.
 *
 * `validate` proves the endpoint really is the product rather than a wildcard host or parked page,
 * and returns the evidence to record.
 */
const probeSelfHostedHost = async (
  domain: string,
  subdomain: string,
  path: string,
  validate: (json: unknown) => ProbeEvidence | null
): Promise<ProbeResult> => {
  const normalized = domain.toLowerCase()
  if (!VALID_DOMAIN.test(normalized)) return notFound
  const baseUrl = `https://${subdomain}.${normalized}`
  const res = await fetchUntrusted(`${baseUrl}${path}`, MAX_BODY_SIZE)
  if (!res) return notFound
  let json: unknown
  try {
    json = JSON.parse(res.buffer.toString('utf8'))
  } catch {
    return notFound
  }
  const evidence = validate(json)
  if (!evidence) return notFound
  return {verdict: 'found', evidence: {baseUrl, ...evidence}}
}

export default probeSelfHostedHost
