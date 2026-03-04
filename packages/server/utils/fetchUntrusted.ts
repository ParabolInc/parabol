import dns from 'dns/promises'
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

async function ensurePublicHostname(hostname: string) {
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

    // 2. Block private/internal IPs (outside lock — doesn't hit the HTTP server)
    await ensurePublicHostname(url.hostname)

    // 3. Serialize per-domain: same-host requests queue, different hosts run concurrently.
    //    Timeout starts AFTER acquiring the lock so queued requests don't expire while waiting.
    return await withDomainLimit(url.hostname, async () => {
      let controller = new AbortController()
      let fetchTimeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        // 4. Fetch (with retry for 429 rate-limiting)
        let response = await fetch(url.toString(), {
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': USER_AGENT
          }
        })

        for (let attempt = 0; response.status === 429 && attempt < MAX_429_RETRIES; attempt++) {
          clearTimeout(fetchTimeout)
          const delay = getRetryDelayMs(response.headers.get('retry-after'), attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
          controller = new AbortController()
          fetchTimeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
          response = await fetch(url.toString(), {
            redirect: 'manual',
            signal: controller.signal,
            headers: {
              'User-Agent': USER_AGENT
            }
          })
        }

        if (response.status >= 300 && response.status < 400) {
          throw new Error('Redirects not allowed')
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        // 5. Content-Type validation
        const contentType = response.headers.get('content-type')
        if (!contentType) {
          throw new Error('Missing Content-Type')
        }

        const normalized = contentType.split(';')[0]!.trim().toLowerCase()

        // 6. Enforce max size (pre-check if possible)
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          const declared = parseInt(contentLength, 10)
          if (!isNaN(declared) && declared > maxSize) {
            throw new Error('File too large')
          }
        }

        // 7. Stream with hard cap
        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const chunks: Buffer[] = []
        let total = 0

        while (true) {
          const {done, value} = await reader.read()
          if (done) break

          total += value.byteLength
          if (total > maxSize) {
            controller.abort()
            throw new Error('File exceeds max size')
          }

          chunks.push(Buffer.from(value))
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
      }
    })
  } catch {
    return null
  }
}
