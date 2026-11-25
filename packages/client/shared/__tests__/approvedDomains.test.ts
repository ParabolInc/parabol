import {formatApprovedList, isEmailOnApprovedList} from '../approvedDomains'

test('isEmailOnApprovedList takes an exact domain, a wildcard or a single address', () => {
  expect(isEmailOnApprovedList('Ana@Kestrel.io', ['kestrel.io'])).toBe(true)
  expect(isEmailOnApprovedList('ana@eu.kestrel.io', ['*.kestrel.io'])).toBe(true)
  expect(isEmailOnApprovedList('ana@kestrel.io', ['*.kestrel.io'])).toBe(true)
  expect(isEmailOnApprovedList('pat.ng@vendor.co', ['pat.ng@vendor.co'])).toBe(true)
  expect(isEmailOnApprovedList('pat.ng@vendor.co', ['kestrel.io'])).toBe(false)
})

test('formatApprovedList names up to three domains', () => {
  expect(formatApprovedList(['kestrel.io'])).toBe('kestrel.io')
  expect(formatApprovedList(['a.io', 'b.io'])).toBe('a.io or b.io')
  expect(formatApprovedList(['a.io', 'b.io', 'c.io'])).toBe('a.io, b.io or c.io')
  expect(formatApprovedList(['a.io', 'b.io', 'c.io', 'd.io', 'e.io'])).toBe(
    'a.io, b.io, c.io, or 2 other domains'
  )
})
