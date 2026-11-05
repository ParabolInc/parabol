import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {FeatureFlagName} from '../../../utils/featureFlags'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const hasOrgFeatureFlag = <T>(
  orgIdDotPath: ResolverDotPath<T>,
  featureName: FeatureFlagName
) =>
  rule(`hasOrgFeatureFlag-${orgIdDotPath}-${featureName}`, {cache: 'strict'})(
    async (source, args, {dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const isEnabled = await dataLoader
        .get('featureFlagByOwnerId')
        .load({ownerId: orgId, featureName})
      if (!isEnabled)
        return new GraphQLError(`${featureName} isn't turned on for this organization`)
      return true
    }
  )
