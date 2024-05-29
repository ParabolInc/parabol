import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import {ResolverDotPath, getResolverDotPath} from './getResolverDotPath'

export const isViewerBillingLeader = <T>(orgIdDotPath: ResolverDotPath<T>) =>
  rule(`isViewerBillingLeader-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser) return new Error('Organization User not found')
      const {role} = organizationUser
      if (role !== 'BILLING_LEADER' && role !== 'ORG_ADMIN')
        return new Error('User is not billing leader')
      return true
    }
  )
