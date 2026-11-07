import {capTier} from '../capTierByLicense'

describe('capTier', () => {
  test('leaves Starter and Stripe-paid organizations alone', () => {
    expect(capTier('starter', false, null)).toBe('starter')
    expect(capTier('enterprise', true, null)).toBe('enterprise')
    expect(capTier('team', true, null)).toBe('team')
  })

  test('drops a paid tier without a subscription to Starter when nothing is licensed', () => {
    expect(capTier('enterprise', false, null)).toBe('starter')
    expect(capTier('team', false, null)).toBe('starter')
  })

  test('caps a paid tier without a subscription at the licensed tier', () => {
    expect(capTier('enterprise', false, 'team')).toBe('team')
    expect(capTier('team', false, 'enterprise')).toBe('team')
    expect(capTier('enterprise', false, 'enterprise')).toBe('enterprise')
  })
})
