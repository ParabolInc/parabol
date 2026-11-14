import net from 'net'
import {Logger} from './Logger'

// Decides which addresses fetchUntrusted is allowed to connect to.
//
// By default anything on a private/loopback/link-local range is blocked so a user-supplied URL
// (a webhook, an embedded image) can't be used to probe the server's own network. Self-hosted
// deployments legitimately run integrations privately (e.g. Mattermost at http://mattermost.internal:8065),
// so the operator can opt specific destinations back in with SSRF_ALLOWED_HOSTS.
//
// SSRF_ALLOWED_HOSTS is a comma separated list where each entry is one of:
//   - a hostname, matched exactly & case-insensitively: `mattermost.internal`, `localhost`
//   - an IP address: `10.0.0.5`, `fd00::1`
//   - a CIDR range: `10.0.0.0/8`, `192.168.1.0/24`, `fd00::/8`
// A hostname entry allows whatever that hostname resolves to. An IP/CIDR entry allows matching
// addresses no matter which hostname resolved to them.

type CidrRange = {bytes: Uint8Array; prefix: number}

const parseIPv4 = (ip: string) => {
  if (!net.isIPv4(ip)) return null
  const bytes = new Uint8Array(4)
  const parts = ip.split('.')
  for (let i = 0; i < 4; i++) {
    bytes[i] = Number(parts[i])
  }
  return bytes
}

// Written as 16 bytes, then collapsed to 4 if it's an IPv4-mapped address (::ffff:127.0.0.1),
// since connecting to one of those lands on the IPv4 address it wraps.
const parseIPv6 = (ip: string) => {
  const withoutZone = ip.split('%')[0]!
  if (!net.isIPv6(withoutZone)) return null
  const halves = withoutZone.split('::')
  if (halves.length > 2) return null

  const toGroups = (half: string | undefined) => (half ? half.split(':') : [])
  const head = toGroups(halves[0])
  const tail = toGroups(halves[1])
  // a trailing IPv4 literal (::ffff:1.2.3.4) occupies 4 bytes instead of 2
  const byteLength = (groups: string[]) =>
    groups.reduce((total, group) => total + (group.includes('.') ? 4 : 2), 0)

  const bytes = new Uint8Array(16)
  const write = (groups: string[], offset: number) => {
    let i = offset
    for (const group of groups) {
      if (group.includes('.')) {
        const v4 = parseIPv4(group)
        if (!v4) return false
        bytes.set(v4, i)
        i += 4
      } else {
        const value = parseInt(group, 16)
        bytes[i++] = value >> 8
        bytes[i++] = value & 0xff
      }
    }
    return true
  }

  const tailOffset = halves.length === 2 ? 16 - byteLength(tail) : byteLength(head)
  if (tailOffset < byteLength(head)) return null
  if (!write(head, 0) || !write(tail, tailOffset)) return null
  if (halves.length === 1 && byteLength(head) !== 16) return null

  const isV4Mapped =
    bytes.subarray(0, 10).every((byte) => byte === 0) && bytes[10] === 0xff && bytes[11] === 0xff
  return isV4Mapped ? bytes.subarray(12) : bytes
}

const parseIP = (ip: string) => parseIPv4(ip) ?? parseIPv6(ip)

const isPrivate = (bytes: Uint8Array) => {
  const a = bytes[0]!
  const b = bytes[1]!
  if (bytes.length === 4) {
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

  const isUnspecified = bytes.every((byte) => byte === 0)
  const isLoopback = bytes.subarray(0, 15).every((byte) => byte === 0) && bytes[15] === 1
  const isUniqueLocal = (a & 0xfe) === 0xfc // fc00::/7
  const isLinkLocal = a === 0xfe && (b & 0xc0) === 0x80 // fe80::/10
  return isUnspecified || isLoopback || isUniqueLocal || isLinkLocal
}

const isInRange = (bytes: Uint8Array, {bytes: rangeBytes, prefix}: CidrRange) => {
  if (bytes.length !== rangeBytes.length) return false
  for (let i = 0, bitsLeft = prefix; bitsLeft > 0; i++, bitsLeft -= 8) {
    const mask = bitsLeft >= 8 ? 0xff : (0xff << (8 - bitsLeft)) & 0xff
    if ((bytes[i]! & mask) !== (rangeBytes[i]! & mask)) return false
  }
  return true
}

const parseAllowlist = (raw: string | undefined) => {
  const hostnames = new Set<string>()
  const ranges = [] as CidrRange[]

  for (const rawEntry of (raw ?? '').split(',')) {
    const entry = rawEntry.trim()
    if (!entry) continue
    const slashIdx = entry.indexOf('/')
    if (slashIdx === -1) {
      const bytes = parseIP(entry)
      if (bytes) {
        ranges.push({bytes, prefix: bytes.length * 8})
      } else {
        hostnames.add(entry.toLowerCase())
      }
      continue
    }
    const bytes = parseIP(entry.slice(0, slashIdx))
    const prefix = Number(entry.slice(slashIdx + 1))
    if (!bytes || !Number.isInteger(prefix) || prefix < 0 || prefix > bytes.length * 8) {
      Logger.warn(`SSRF_ALLOWED_HOSTS: ignoring invalid entry "${entry}"`)
      continue
    }
    ranges.push({bytes, prefix})
  }

  return {hostnames, ranges}
}

const allowlist = parseAllowlist(process.env.SSRF_ALLOWED_HOSTS)

/**
 * True if the operator configured SSRF_ALLOWED_HOSTS at all. Without one, a block is the guard
 * working as designed (a user pointed us at a private address) and nothing an operator can act on.
 * With one, a block usually means the allowlist is missing an entry, which is worth surfacing.
 */
export const hasAllowlist = () => allowlist.hostnames.size > 0 || allowlist.ranges.length > 0

/** True if the operator allowlisted this hostname, meaning whatever it resolves to is fair game. */
export const isAllowlistedHostname = (hostname: string) =>
  allowlist.hostnames.has(hostname.toLowerCase())

/** True if connecting to this address is disallowed. Unparseable addresses fail closed. */
export const isBlockedAddress = (ip: string) => {
  const bytes = parseIP(ip)
  if (!bytes) return true
  if (!isPrivate(bytes)) return false
  return !allowlist.ranges.some((range) => isInRange(bytes, range))
}
