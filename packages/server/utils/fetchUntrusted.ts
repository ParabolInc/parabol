import dns from 'dns/promises'
import net from 'net'

const TIMEOUT_MS = 15_000

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
  const records = await dns.lookup(hostname, {all: true})

  if (!records.length) {
    throw new Error('DNS resolution failed')
  }

  for (const {address} of records) {
    if (isPrivateIP(address)) {
      throw new Error(`Blocked private IP: ${address}`)
    }
  }
}

export const fetchUntrusted = async (input: string, maxSize: number) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // 1. Validate URL
    let url: URL
    try {
      url = new URL(input)
    } catch {
      throw new Error('Invalid URL')
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Only http/https allowed')
    }

    // 2. Block private/internal IPs
    await ensurePublicHostname(url.hostname)

    // 3. Fetch (no redirects)
    const response = await fetch(url.toString(), {
      redirect: 'manual',
      signal: controller.signal
    })

    if (response.status >= 300 && response.status < 400) {
      throw new Error('Redirects not allowed')
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    // 4. Content-Type validation
    const contentType = response.headers.get('content-type')
    if (!contentType) {
      throw new Error('Missing Content-Type')
    }

    const normalized = contentType.split(';')[0]!.trim().toLowerCase()

    // 5. Enforce max size (pre-check if possible)
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      const declared = parseInt(contentLength, 10)
      if (!isNaN(declared) && declared > maxSize) {
        throw new Error('File too large')
      }
    }

    // 6. Stream with hard cap
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

    clearTimeout(timeout)

    return {
      buffer: Buffer.concat(chunks) as Buffer<ArrayBufferLike>,
      contentType: normalized,
      size: total
    }
  } catch {
    clearTimeout(timeout)
    return null
  }
}
