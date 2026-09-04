import fetchWithRetry from '../../utils/fetchWithRetry'

const PROBE_DEADLINE_MS = 10_000

export interface ProbeJsonResponse {
  status: number
  json: unknown
}

/**
 * Fetch a vendor lookup endpoint where the status code carries meaning — a GitHub 404 is a real
 * "no such account", not a failure. Returns null when the request could not be completed at all,
 * which callers record as `inconclusive` rather than `notFound`.
 *
 * Only for fixed, first-party vendor hostnames. Anything derived from a user-controlled email
 * domain must go through fetchUntrusted instead, which pins DNS and blocks private addresses.
 */
const probeFetchJson = async (
  url: string,
  headers: Record<string, string> = {}
): Promise<ProbeJsonResponse | null> => {
  let res: Response
  try {
    res = await fetchWithRetry(url, {
      headers: {Accept: 'application/json', ...headers},
      deadline: new Date(Date.now() + PROBE_DEADLINE_MS)
    })
  } catch {
    return null
  }
  const text = await res.text().catch(() => '')
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return {status: res.status, json}
}

export default probeFetchJson
