import type dnsSync from 'dns'
import dns from 'dns/promises'
import http from 'http'
import https from 'https'
import net from 'net'

const TIMEOUT_MS = 15_000
const MAX_429_RETRIES = 1
const USER_AGENT = `Parabol/${__APP_VERSION__} (https://parabol.co)`

// Per-domain serialization to prevent overwhelming external servers with
// concurrent requests. When multiple fetches target the same hostname, they
// queue and execute one at a time. Different hostnames run concurrently.
const domainLocks = new Map<string, Promise<void>>()

function withDomainLimit<T>(hostname: string, fn: () => Promise<T>): Promise<T> {
  const prev = domainLocks.get(hostname) ?? Promise.resolve()
  let releaseLock!: () => void
  const lock = new Promise<void>((resolve) => {
    releaseLock = resolve
  })
  domainLocks.set(hostname, lock)

  return prev.then(async () => {
    try {
      return await fn()
    } finally {
      releaseLock()
      if (domainLocks.get(hostname) === lock) {
        domainLocks.delete(hostname)
      }
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

function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number)
    const [a, b] = parts as [number, number]

    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127)
    )
  }

  if (net.isIPv6(ip)) {
    const low = ip.toLowerCase()
    return (
      low === '::1' ||
      low === '::' ||
      low.startsWith('fc') ||
      low.startsWith('fd') ||
      low.startsWith('fe80')
    )
  }

  return true
}

// Resolve and validate hostname, returning the validated addresses.
// Addresses are reused for the actual request to prevent DNS rebinding.
async function resolveAndValidateHostname(hostname: string): Promise<string[]> {
  // Use dns.resolve4/resolve6 instead of dns.lookup.
  // dns.lookup uses the libuv thread pool (default 4 threads), which
  // becomes a bottleneck under concurrent fetches. dns.resolve uses
  // c-ares which is fully async and doesn't consume thread pool threads.
  const results = await Promise.allSettled([dns.resolve4(hostname), dns.resolve6(hostname)])

  const addresses: string[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      addresses.push(...result.value)
    }
  }

  if (addresses.length === 0) {
    throw new Error('DNS resolution failed')
  }

  for (const address of addresses) {
    if (isPrivateIP(address)) {
      throw new Error(`Blocked private IP: ${address}`)
    }
  }

  return addresses
}

// Create an HTTP(S) agent that pins DNS to pre-validated addresses,
// preventing DNS rebinding between validation and connection.
function createPinnedAgent(protocol: string, addresses: string[]) {
  const Mod = protocol === 'https:' ? https : http
  const lookup: net.LookupFunction = (
    _hostname: string,
    _options: dnsSync.LookupOptions,
    cb: (
      err: NodeJS.ErrnoException | null,
      address: string | dnsSync.LookupAddress[],
      family?: number
    ) => void
  ) => {
    cb(
      null,
      addresses.map((addr) => ({
        address: addr,
        family: net.isIPv4(addr) ? 4 : 6
      }))
    )
  }
  return new Mod.Agent({lookup})
}

interface PinnedResponse {
  status: number
  headers: http.IncomingHttpHeaders
  body: http.IncomingMessage
}

function pinnedRequest(
  url: URL,
  agent: http.Agent | https.Agent,
  signal: AbortSignal
): Promise<PinnedResponse> {
  const mod = url.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const req = mod.request(
      url,
      {agent, method: 'GET', headers: {'User-Agent': USER_AGENT}, signal},
      (res) => resolve({status: res.statusCode!, headers: res.headers, body: res})
    )
    req.on('error', reject)
    req.end()
  })
}

export const fetchUntrusted = async (input: string, maxSize: number) => {
  try {
    // 1. Validate URL (outside lock — synchronous, instant)
    let url: URL
    try {
      url = new URL(input)
    } catch {
      throw new Error('Invalid URL')
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Only http/https allowed')
    }

    // 2. Resolve DNS and validate IPs are public (outside lock — doesn't hit the HTTP server).
    //    Resolved addresses are pinned to the agent to prevent DNS rebinding.
    const addresses = await resolveAndValidateHostname(url.hostname)
    const agent = createPinnedAgent(url.protocol, addresses)

    // 3. Serialize per-domain: same-host requests queue, different hosts run concurrently.
    //    Timeout starts AFTER acquiring the lock so queued requests don't expire while waiting.
    return await withDomainLimit(url.hostname, async () => {
      let controller = new AbortController()
      let fetchTimeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        // 4. Request with pinned DNS (with retry for 429 rate-limiting)
        let response = await pinnedRequest(url, agent, controller.signal)

        for (let attempt = 0; response.status === 429 && attempt < MAX_429_RETRIES; attempt++) {
          clearTimeout(fetchTimeout)
          response.body.destroy()
          const retryAfter = response.headers['retry-after'] ?? null
          const delay = getRetryDelayMs(
            Array.isArray(retryAfter) ? retryAfter[0]! : retryAfter,
            attempt
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          controller = new AbortController()
          fetchTimeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
          response = await pinnedRequest(url, agent, controller.signal)
        }

        if (response.status >= 300 && response.status < 400) {
          response.body.destroy()
          throw new Error('Redirects not allowed')
        }

        if (response.status < 200 || response.status >= 300) {
          response.body.destroy()
          throw new Error(`HTTP error: ${response.status}`)
        }

        // 5. Content-Type validation
        const contentType = response.headers['content-type']
        if (!contentType) {
          response.body.destroy()
          throw new Error('Missing Content-Type')
        }

        const normalized = contentType.split(';')[0]!.trim().toLowerCase()

        // 6. Enforce max size (pre-check if possible)
        const contentLength = response.headers['content-length']
        if (contentLength) {
          const declared = parseInt(contentLength, 10)
          if (!isNaN(declared) && declared > maxSize) {
            response.body.destroy()
            throw new Error('File too large')
          }
        }

        // 7. Stream with hard cap
        const chunks: Buffer[] = []
        let total = 0

        for await (const chunk of response.body) {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array)
          total += buf.byteLength
          if (total > maxSize) {
            response.body.destroy()
            throw new Error('File exceeds max size')
          }
          chunks.push(buf)
        }

        clearTimeout(fetchTimeout)

        return {
          buffer: Buffer.concat(chunks) as Buffer<ArrayBufferLike>,
          contentType: normalized,
          size: total
        }
      } catch (e) {
        clearTimeout(fetchTimeout)
        throw e
      } finally {
        agent.destroy()
      }
    })
  } catch {
    return null
  }
}
