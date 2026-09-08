import dns from 'dns/promises'
import type {ProbeResult} from './AccountProber'
import {inconclusive, notFound} from './AccountProber'

const GOOGLE_MX_SUFFIXES = ['.google.com', '.googlemail.com']

// gcal and gmeet share this lookup; concurrent callers for a domain share the in-flight promise
const inFlight = new Map<string, Promise<ProbeResult>>()

const lookup = async (domain: string): Promise<ProbeResult> => {
  let records: {exchange: string; priority: number}[]
  try {
    records = await dns.resolveMx(domain)
  } catch (e) {
    // NXDOMAIN/ENODATA is a real answer: the domain routes no mail through Google
    const code = (e as NodeJS.ErrnoException).code
    if (code === 'ENOTFOUND' || code === 'ENODATA') return notFound
    return inconclusive(`mx lookup failed: ${code ?? 'unknown'}`)
  }
  const match = records.find(({exchange}) => {
    const host = exchange.toLowerCase().replace(/\.$/, '')
    return GOOGLE_MX_SUFFIXES.some((suffix) => host.endsWith(suffix))
  })
  if (!match) return notFound
  return {verdict: 'found', evidence: {mxHost: match.exchange}}
}

const fetchGoogleWorkspaceMx = (domain: string): Promise<ProbeResult> => {
  const pending = inFlight.get(domain)
  if (pending) return pending
  const promise = lookup(domain).finally(() => {
    inFlight.delete(domain)
  })
  inFlight.set(domain, promise)
  return promise
}

export default fetchGoogleWorkspaceMx
