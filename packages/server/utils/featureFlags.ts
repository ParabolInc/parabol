export interface FeatureFlag {
  featureName: string
  scope: 'Organization' | 'Team' | 'User'
  description: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
}

export const FEATURE_FLAGS = {
  oauthProvider: {
    featureName: 'oauthProvider',
    scope: 'Organization',
    description: 'Create OAuth 2.0 tokens to execute custom GraphQL queries',
    expiresAt: new Date('2026-11-30T23:59:59.999+00:00'),
    createdAt: new Date('2026-01-15T12:56:35.316792+00:00'),
    updatedAt: new Date('2026-01-15T12:56:35.316792+00:00'),
    isPublic: false
  },
  SCIM: {
    featureName: 'SCIM',
    scope: 'Organization',
    description: 'Provision organization users via SCIM',
    expiresAt: new Date('2026-11-30T23:59:59.999+00:00'),
    createdAt: new Date('2026-02-04T21:22:20.661405+00:00'),
    updatedAt: new Date('2026-02-04T21:22:20.661405+00:00'),
    isPublic: false
  },
  Databases: {
    featureName: 'Databases',
    scope: 'Organization',
    description: 'Experimental databases in pages',
    expiresAt: new Date('2027-03-01T00:00:00+00:00'),
    createdAt: new Date('2025-11-20T12:18:02.763416+00:00'),
    updatedAt: new Date('2025-11-20T12:18:02.763416+00:00'),
    isPublic: true
  }
} as const satisfies Record<string, FeatureFlag>

export type FeatureFlagName = keyof typeof FEATURE_FLAGS

export type FeatureFlagRecord = FeatureFlag & {featureName: FeatureFlagName}

export function getFeatureFlag(featureName: FeatureFlagName): FeatureFlagRecord
export function getFeatureFlag(featureName: string): FeatureFlagRecord | undefined
export function getFeatureFlag(featureName: string) {
  return (FEATURE_FLAGS as Record<string, FeatureFlagRecord>)[featureName]
}

export const getFeatureFlagsByScope = (
  scope: FeatureFlag['scope'] | 'all'
): FeatureFlagRecord[] => {
  const now = new Date()
  return Object.values(FEATURE_FLAGS)
    .filter((flag) => flag.expiresAt > now)
    .filter((flag) => scope === 'all' || flag.scope === scope)
    .sort((a, b) => a.featureName.localeCompare(b.featureName))
}
