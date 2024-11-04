import {FeatureFlagResolvers} from '../resolverTypes'

export type FeatureFlagSource = {
  featureName: string
  description: string
  expiresAt: Date
  scope: 'Organization' | 'User' | 'Team'
  enabled?: boolean
}

export const FeatureFlag: FeatureFlagResolvers = {
  enabled: async ({enabled}, _args) => {
    console.log('🚀 ~ enabled <><><>><><>:', enabled)
    if (enabled !== undefined) return enabled
    return true
  }
}
