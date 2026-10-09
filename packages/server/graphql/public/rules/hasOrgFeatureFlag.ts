import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {FeatureFlagName} from '../../../utils/featureFlags'
import type {GQLContext} from '../../graphql'

export const hasOrgFeatureFlag = (featureName: FeatureFlagName) =>
  rule(`hasOrgFeatureFlag-${featureName}`, {cache: 'contextual'})(
    async (_source, _args, {authToken, dataLoader}: GQLContext) => {
      const viewerId = getUserId(authToken)
      const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
      const flags = await Promise.all(
        organizationUsers.map(({orgId}) =>
          dataLoader.get('featureFlagByOwnerId').load({ownerId: orgId, featureName})
        )
      )
      if (!flags.some(Boolean)) {
        return new GraphQLError(`${featureName} is not enabled for your organization`)
      }
      return true
    }
  )
