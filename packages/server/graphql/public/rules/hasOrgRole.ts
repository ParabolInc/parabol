import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {Orguserroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const hasOrgRole = <T>(orgIdDotPath: ResolverDotPath<T>, role: Orguserroleenum) =>
  rule(`hasOrgRole-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const {authToken, dataLoader} = context
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser) return new GraphQLError('Viewer is not on Organization')
      if (organizationUser.role !== role) return new GraphQLError(`User is not ${role}`)
      if (context.resourceGrants && !(await context.resourceGrants.hasOrg(orgId))) {
        return new GraphQLError(`PAT does not grant access to this organization`)
      }
      return true
    }
  )
