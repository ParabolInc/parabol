import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isViewerBillingLeader = <T>(orgIdDotPath: ResolverDotPath<T>) =>
  rule(`isViewerBillingLeader-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser) return new GraphQLError('Viewer is not on Organization')
      const {role} = organizationUser
      if (role !== 'BILLING_LEADER' && role !== 'ORG_ADMIN')
        return new GraphQLError('User is not billing leader')
      return true
    }
  )
