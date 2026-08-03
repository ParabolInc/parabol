import {fetch, Response} from '@whatwg-node/fetch'
import type {LookupAddress} from 'dns'
import dns from 'dns/promises'
import http from 'http'
import https from 'https'
import net, {type LookupFunction} from 'net'
import type {Duplex} from 'stream'
import {Logger} from './Logger'
import {hasAllowlist, isAllowlistedHostname, isBlockedAddress} from './privateIpGuard'

const TIMEOUT_MS = 15_000
const MAX_429_RETRIES = 1
const USER_AGENT = `Parabol/${__APP_VERSION__} (https://parabol.co)`

// Per-domain serialization to prevent overwhelming external servers with
// concurrent requests. When multiple fetches target the same hostname, they
// queue and execute one at a time. Different hostnames run concurrently.
//
// Uses an explicit queue instead of chaining .then() on promises so that
// each queued callback is a single function reference rather than a growing
// closure chain that pins earlier fn/agent/lock objects in memory until the
// entire chain settles.
const domainQueues = new Map<string, (() => void)[]>()

function withDomainLimit<T>(hostname: string, fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const execute = async () => {
      try {
        resolve(await fn())
      } catch (e) {
        reject(e)
      } finally {
        const queue = domainQueues.get(hostname)
        if (queue && queue.length > 0) {
          const next = queue.shift()!
          next()
        } else {
          domainQueues.delete(hostname)
        }
      }
    }

    const queue = domainQueues.get(hostname)
    if (queue) {
      queue.push(execute)
    } else {
      domainQueues.set(hostname, [])
      execute()
    }
  })
}

/** Parse Retry-After header (seconds) into a delay in ms, with jitter to avoid thundering herd. */
function getRetryDelayMs(retryAfterHeader: string | null, attempt: number): number {
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10)
    if (!isNaN(seconds) && seconds > 0 && seconds <= 30) {
      return seconds * 1000 + Math.random() * 1000
    }
  }
  // Exponential backoff with jitter: ~1-2s, ~2-3s
  return (attempt + 1) * 1000 + Math.random() * 1000
}

// The ponyfill fetch also resolves file:, data: and blob: URLs, so rejecting every other protocol
// here is what keeps a user-supplied URL from reading the local disk.
const parseHttpUrl = (input: string, base?: URL) => {
  let url: URL
  try {
    url = new URL(input, base)
  } catch {
    throw new Error('Invalid URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http/https allowed')
  }
  return url
}

// URL.hostname keeps the brackets around an IPv6 literal, which DNS & the guard don't want
const getHostname = (url: URL) => url.hostname.replace(/^\[|\]$/g, '')

// Refusing a private address is the guard doing its job, not a fault: on a deployment without an
// allowlist it just means someone handed us a URL pointing at the local network. Only once the
// operator has configured SSRF_ALLOWED_HOSTS does a block hint at a missing entry worth logging.
class BlockedAddressError extends Error {
  name = 'BlockedAddressError'
}

// The socket error travels back through the fetch ponyfill, which may wrap it in its own error
const isBlockedAddressError = (e: unknown): boolean =>
  e instanceof BlockedAddressError || (e instanceof Error && isBlockedAddressError(e.cause))

/** Blocks that carry no signal for an operator, so they belong at debug instead of the usual level. */
const isExpectedBlock = (e: unknown) => isBlockedAddressError(e) && !hasAllowlist()

// Resolve a hostname to the addresses we're allowed to connect to.
// Use dns.resolve4/resolve6 instead of dns.lookup.
// dns.lookup uses the libuv thread pool (default 4 threads), which
// becomes a bottleneck under concurrent fetches. dns.resolve uses
// c-ares which is fully async and doesn't consume thread pool threads.
async function resolveSafeAddresses(hostname: string): Promise<LookupAddress[]> {
  // A URL may point straight at an IP (http://10.0.0.5:8065), which c-ares won't resolve
  if (net.isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new BlockedAddressError(`Blocked private IP: ${hostname}`)
    }
    return [{address: hostname, family: net.isIPv6(hostname) ? 6 : 4}]
  }

  // An allowlisted hostname is one the operator vouched for, so whatever it resolves to is fair game
  const isAllowlisted = isAllowlistedHostname(hostname)
  const [v4, v6] = await Promise.allSettled([dns.resolve4(hostname), dns.resolve6(hostname)])

  const addresses: LookupAddress[] = []
  if (v4.status === 'fulfilled') {
    addresses.push(...v4.value.map((address) => ({address, family: 4})))
  }
  if (v6.status === 'fulfilled') {
    addresses.push(...v6.value.map((address) => ({address, family: 6})))
  }

  if (addresses.length === 0 && isAllowlisted) {
    // c-ares only talks to nameservers, so names that live in /etc/hosts (or mDNS) never resolve.
    // Fall back to the OS resolver, but only for allowlisted hosts: dns.lookup burns a libuv
    // thread pool slot, so arbitrary unresolvable hostnames must not reach it.
    const lookedUp = await dns.lookup(hostname, {all: true}).catch(() => [])
    addresses.push(...lookedUp)
  }

  if (addresses.length === 0) {
    throw new Error(`DNS resolution failed: ${hostname}`)
  }
  if (isAllowlisted) return addresses

  for (const {address} of addresses) {
    if (isBlockedAddress(address)) {
      throw new BlockedAddressError(`Blocked private IP: ${address} (${hostname})`)
    }
  }
  return addresses
}

// Validating inside the lookup is what makes DNS rebinding impossible: net.connect uses exactly the
// addresses this callback returns and never re-resolves the hostname afterward, so there is no
// window between the check and the connection for a record to change under us.
const safeLookup: LookupFunction = (hostname, options, callback) => {
  resolveSafeAddresses(hostname).then(
    (addresses) => {
      const first = addresses[0]!
      if (options.all) {
        callback(null, addresses)
      } else {
        callback(null, first.address, first.family)
      }
    },
    (err) => callback(err, [])
  )
}

// Defense in depth. safeLookup only ever hands back validated addresses, but if the lookup option
// were ever dropped, Node would silently fall back to dns.lookup and the guard would fail open.
// A socket's real peer can't be faked by a config mistake.
const verifyPeer = (socket: net.Socket, hostname: string | undefined) => {
  const {remoteAddress} = socket
  if (!remoteAddress) return
  if (hostname && isAllowlistedHostname(hostname)) return
  if (isBlockedAddress(remoteAddress)) {
    socket.destroy(new BlockedAddressError(`Blocked private IP: ${remoteAddress} (${hostname})`))
  }
}

const guardSocket = (socket: Duplex | null | undefined, hostname: string | undefined) => {
  if (socket instanceof net.Socket) {
    socket.once('connect', () => verifyPeer(socket, hostname))
    socket.once('secureConnect', () => verifyPeer(socket, hostname))
  }
  return socket
}

type ConnectionCallback = (err: Error | null, stream: Duplex) => void

class GuardedHttpAgent extends http.Agent {
  createConnection(options: http.ClientRequestArgs, callback?: ConnectionCallback) {
    const hostname = options.host ?? options.hostname ?? undefined
    return guardSocket(super.createConnection(options, callback), hostname)
  }
}

class GuardedHttpsAgent extends https.Agent {
  createConnection(options: https.RequestOptions, callback?: ConnectionCallback) {
    const hostname = options.host ?? options.hostname ?? undefined
    return guardSocket(super.createConnection(options, callback), hostname)
  }
}

// One agent per protocol, shared across requests. keepAlive reuses connections (which also means a
// pooled socket stays validated even if DNS later changes), and timeout reaps sockets that stall.
const agentOptions = {keepAlive: true, timeout: TIMEOUT_MS, lookup: safeLookup}
const httpAgent = new GuardedHttpAgent(agentOptions)
const httpsAgent = new GuardedHttpsAgent(agentOptions)

const fetchOnce = (
  url: URL,
  options: {
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: string
    signal?: AbortSignal
  }
) =>
  fetch(url, {
    method: options.method ?? 'GET',
    headers: {'User-Agent': USER_AGENT, ...options.headers},
    body: options.body,
    // Never delegate redirects: the ponyfill's 'follow' has no hop limit and copies Authorization
    // to the new origin. The loops below re-validate every hop instead.
    redirect: 'manual',
    signal: options.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    agent: url.protocol === 'https:' ? httpsAgent : httpAgent
  })

/**
 * Read a body with a hard size cap. Always settles the stream so keepAlive sockets are released
 * rather than left half-read in the pool.
 */
const readBodyCapped = async (
  body: ReadableStream<Uint8Array> | null,
  maxSize: number,
  onOverflow: 'throw' | 'truncate' = 'throw'
) => {
  if (!body) return Buffer.alloc(0)
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const {done, value} = await reader.read()
      if (done || !value) break
      total += value.byteLength
      if (total > maxSize) {
        if (onOverflow === 'throw') throw new Error('File exceeds max size')
        break
      }
      chunks.push(value)
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return Buffer.concat(chunks)
}

export const fetchUntrusted = async (
  input: string,
  maxSize: number,
  options?: {headers?: Record<string, string>; maxRedirects?: number}
) => {
  try {
    let currentUrl = parseHttpUrl(input)
    let currentHeaders = options?.headers
    let redirectsLeft = options?.maxRedirects ?? 0

    while (true) {
      // Serialize per-domain: same-host requests queue, different hosts run concurrently.
      // The timeout starts AFTER acquiring the lock so queued requests don't expire while waiting.
      const outcome = await withDomainLimit(getHostname(currentUrl), async () => {
        let response = await fetchOnce(currentUrl, {headers: currentHeaders})

        for (let attempt = 0; response.status === 429 && attempt < MAX_429_RETRIES; attempt++) {
          await response.body?.cancel()
          const delay = getRetryDelayMs(response.headers.get('retry-after'), attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
          response = await fetchOnce(currentUrl, {headers: currentHeaders})
        }

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location')
          await response.body?.cancel()
          // Return a sentinel so we can release the domain lock before re-resolving
          return {redirect: location}
        }

        if (!response.ok) {
          await response.body?.cancel()
          throw new Error(`HTTP error: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType) {
          await response.body?.cancel()
          throw new Error('Missing Content-Type')
        }

        // Pre-check the declared size before streaming. The cap below is the real enforcement,
        // since content-length is both optional and pre-decompression.
        const declaredSize = Number(response.headers.get('content-length'))
        if (declaredSize > maxSize) {
          await response.body?.cancel()
          throw new Error('File too large')
        }

        // widened so callers can pass it alongside other Buffers (e.g. compressImage output)
        const buffer: Buffer<ArrayBufferLike> = await readBodyCapped(response.body, maxSize)
        return {
          buffer,
          contentType: contentType.split(';')[0]!.trim().toLowerCase(),
          size: buffer.byteLength
        }
      })

      if ('redirect' in outcome) {
        if (redirectsLeft <= 0 || !outcome.redirect) {
          throw new Error('Redirects not allowed')
        }
        const redirectUrl = parseHttpUrl(outcome.redirect, currentUrl)
        // Strip Authorization on cross-origin redirects to avoid leaking credentials
        if (redirectUrl.hostname !== currentUrl.hostname && currentHeaders?.Authorization) {
          const {Authorization: _dropped, ...rest} = currentHeaders
          currentHeaders = Object.keys(rest).length > 0 ? rest : undefined
        }
        currentUrl = redirectUrl
        redirectsLeft--
        continue
      }

      return outcome
    }
  } catch (e) {
    const log = isExpectedBlock(e) ? Logger.debug : Logger.log
    log(e)
    return null
  }
}

const MAX_WEBHOOK_RESPONSE_SIZE = 100_000

export const postUntrusted = async (
  url: string,
  options: {
    headers?: Record<string, string>
    body: string
    signal?: AbortSignal
  }
): Promise<Response | null> => {
  // logged on failure. Never log the whole URL, webhook URLs carry a secret in the path
  let host = 'invalid URL'
  try {
    const parsed = parseHttpUrl(url)
    host = parsed.host
    const response = await fetchOnce(parsed, {
      method: 'POST',
      headers: options.headers,
      body: options.body,
      signal: options.signal
    })
    // Buffer the (capped) body so the socket is released before the caller reads it
    const buffer = await readBodyCapped(response.body, MAX_WEBHOOK_RESPONSE_SIZE, 'truncate')
    return new Response(buffer, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  } catch (e) {
    const log = isExpectedBlock(e) ? Logger.debug : Logger.warn
    log(`postUntrusted failed for ${host}`, e)
    return null
  }
}
