import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import {ResolverDotPath, getResolverDotPath} from './getResolverDotPath'

export const isViewerOnOrg = <T>(orgIdDotPath: ResolverDotPath<T>) =>
  rule(`isViewerOnOrg-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser) return new Error('Viewer is not on Organization')
      return true
    }
  )
