import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {Orguserroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import type {RuleContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const hasOrgRole = <T>(
  dotPath: ResolverDotPath<T>,
  role: Orguserroleenum,
  dataLoaderName?: 'saml'
) =>
  rule(`hasOrgRole-${dotPath}-${dataLoaderName ?? 'orgId'}`, {cache: 'strict'})(
    async (source, args, context: RuleContext) => {
      const {authToken, dataLoader} = context
      const id = getResolverDotPath(dotPath, source, args)
      const orgId = dataLoaderName ? (await dataLoader.get(dataLoaderName).load(id))?.orgId : id
      if (!orgId)
        return new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser)
        return new GraphQLError('Viewer is not on Organization', {extensions: {code: 'FORBIDDEN'}})
      if (organizationUser.role !== role)
        return new GraphQLError(`User is not ${role}`, {extensions: {code: 'FORBIDDEN'}})
      if (context.resourceGrants && !(await context.resourceGrants.hasOrg(orgId))) {
        return new GraphQLError(`PAT does not grant access to this organization`, {
          extensions: {code: 'FORBIDDEN'}
        })
      }
      return true
    }
  )
