import {capTier} from '../capTierByLicense'

describe('capTier', () => {
  test('leaves Starter and Stripe-paid organizations alone', () => {
    expect(capTier('starter', false, false)).toBe('starter')
    expect(capTier('enterprise', true, false)).toBe('enterprise')
    expect(capTier('team', true, false)).toBe('team')
  })

  test('drops a paid tier without a subscription to Starter when paid tiers aren’t allowed', () => {
    expect(capTier('enterprise', false, false)).toBe('starter')
    expect(capTier('team', false, false)).toBe('starter')
  })

  test('keeps a paid tier without a subscription when the license allows it', () => {
    expect(capTier('enterprise', false, true)).toBe('enterprise')
    expect(capTier('team', false, true)).toBe('team')
  })
})
