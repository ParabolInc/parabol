// The allowlist is parsed from process.env when the module loads, so each scenario needs a
// fresh copy of the module. Everything here guards outbound requests against SSRF, so a
// regression that lets a private address through is a security bug, not a papercut.
const loadGuard = (allowedHosts?: string) => {
  jest.resetModules()
  if (allowedHosts === undefined) {
    delete process.env.SSRF_ALLOWED_HOSTS
  } else {
    process.env.SSRF_ALLOWED_HOSTS = allowedHosts
  }
  return require('../privateIpGuard') as typeof import('../privateIpGuard')
}

describe('isBlockedAddress', () => {
  test('blocks private, loopback, link-local, and CGNAT IPv4', () => {
    const {isBlockedAddress} = loadGuard()
    expect(isBlockedAddress('10.1.2.3')).toBe(true)
    expect(isBlockedAddress('127.0.0.1')).toBe(true)
    expect(isBlockedAddress('172.16.0.1')).toBe(true)
    expect(isBlockedAddress('172.31.255.255')).toBe(true)
    expect(isBlockedAddress('192.168.1.1')).toBe(true)
    expect(isBlockedAddress('0.0.0.0')).toBe(true)
    expect(isBlockedAddress('169.254.169.254')).toBe(true)
    expect(isBlockedAddress('100.64.0.1')).toBe(true)
  })

  test('allows public IPv4', () => {
    const {isBlockedAddress} = loadGuard()
    expect(isBlockedAddress('8.8.8.8')).toBe(false)
    expect(isBlockedAddress('172.32.0.1')).toBe(false)
    expect(isBlockedAddress('192.169.0.1')).toBe(false)
    expect(isBlockedAddress('100.128.0.1')).toBe(false)
  })

  test('blocks private IPv6', () => {
    const {isBlockedAddress} = loadGuard()
    expect(isBlockedAddress('::1')).toBe(true)
    expect(isBlockedAddress('::')).toBe(true)
    expect(isBlockedAddress('fd00::1')).toBe(true)
    expect(isBlockedAddress('FC00::1')).toBe(true)
    expect(isBlockedAddress('fe80::1')).toBe(true)
    expect(isBlockedAddress('febf::1')).toBe(true)
  })

  test('allows public IPv6', () => {
    const {isBlockedAddress} = loadGuard()
    expect(isBlockedAddress('2606:4700:4700::1111')).toBe(false)
    expect(isBlockedAddress('fec0::1')).toBe(false)
  })

  test('blocks IPv4-mapped IPv6, which connects to the wrapped IPv4 address', () => {
    const {isBlockedAddress} = loadGuard()
    expect(isBlockedAddress('::ffff:127.0.0.1')).toBe(true)
    expect(isBlockedAddress('::ffff:7f00:1')).toBe(true)
    expect(isBlockedAddress('::ffff:8.8.8.8')).toBe(false)
  })

  test('fails closed on garbage', () => {
    const {isBlockedAddress} = loadGuard()
    expect(isBlockedAddress('not-an-ip')).toBe(true)
    expect(isBlockedAddress('')).toBe(true)
    expect(isBlockedAddress('999.999.999.999')).toBe(true)
  })

  test('allows a single allowlisted IP but nothing else private', () => {
    const {isBlockedAddress} = loadGuard('10.0.0.5')
    expect(isBlockedAddress('10.0.0.5')).toBe(false)
    expect(isBlockedAddress('10.0.0.6')).toBe(true)
  })

  test('allows an IPv4 CIDR range', () => {
    const {isBlockedAddress} = loadGuard('192.168.1.0/24')
    expect(isBlockedAddress('192.168.1.0')).toBe(false)
    expect(isBlockedAddress('192.168.1.255')).toBe(false)
    expect(isBlockedAddress('192.168.2.1')).toBe(true)
    expect(isBlockedAddress('10.0.0.1')).toBe(true)
  })

  test('handles prefixes that do not fall on a byte boundary', () => {
    const {isBlockedAddress} = loadGuard('10.0.0.0/12')
    expect(isBlockedAddress('10.0.0.1')).toBe(false)
    expect(isBlockedAddress('10.15.255.255')).toBe(false)
    expect(isBlockedAddress('10.16.0.1')).toBe(true)
  })

  test('allows an IPv6 CIDR range without crossing families', () => {
    const {isBlockedAddress} = loadGuard('fd00::/8')
    expect(isBlockedAddress('fd00::1')).toBe(false)
    expect(isBlockedAddress('fdff:ffff::1')).toBe(false)
    expect(isBlockedAddress('fc00::1')).toBe(true)
    expect(isBlockedAddress('10.0.0.1')).toBe(true)
  })

  test('accepts several entries with stray whitespace', () => {
    const {isBlockedAddress} = loadGuard(' localhost , 10.0.0.0/8 ,, 172.16.0.1 ')
    expect(isBlockedAddress('10.9.9.9')).toBe(false)
    expect(isBlockedAddress('172.16.0.1')).toBe(false)
    expect(isBlockedAddress('192.168.0.1')).toBe(true)
  })

  test('ignores malformed entries instead of allowing everything', () => {
    const {isBlockedAddress} = loadGuard('10.0.0.0/99,10.0.0.0/abc,/8')
    expect(isBlockedAddress('10.0.0.1')).toBe(true)
  })
})

describe('isAllowlistedHostname', () => {
  test('matches exactly, case-insensitively', () => {
    const {isAllowlistedHostname} = loadGuard('localhost,Mattermost.Internal')
    expect(isAllowlistedHostname('localhost')).toBe(true)
    expect(isAllowlistedHostname('mattermost.internal')).toBe(true)
    expect(isAllowlistedHostname('MATTERMOST.INTERNAL')).toBe(true)
  })

  test('does not match subdomains or unlisted hosts', () => {
    const {isAllowlistedHostname} = loadGuard('mattermost.internal')
    expect(isAllowlistedHostname('evil.mattermost.internal')).toBe(false)
    expect(isAllowlistedHostname('mattermost.internal.evil.com')).toBe(false)
    expect(isAllowlistedHostname('example.com')).toBe(false)
  })

  test('is empty when unset', () => {
    const {isAllowlistedHostname} = loadGuard()
    expect(isAllowlistedHostname('localhost')).toBe(false)
  })
})
