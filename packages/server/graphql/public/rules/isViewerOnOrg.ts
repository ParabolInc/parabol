import {GraphQLError, type GraphQLResolveInfo} from 'graphql'
import {rule} from 'graphql-shield'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isViewerOnOrg = <T>(
  orgIdDotPath: ResolverDotPath<T>,
  dataLoaderName?: AllPrimaryLoaders
) =>
  rule(`isViewerOnOrg-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, context: GQLContext, info: GraphQLResolveInfo) => {
      const {authToken, dataLoader} = context
      const argVar = getResolverDotPath(orgIdDotPath, source, args)
      let orgId: string = argVar
      if (dataLoaderName) {
        const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
        if (!subject?.orgId)
          return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
        orgId = subject.orgId
      }
      // Special case for ghost org so users can view meeting template meta
      if (info.operation.operation !== 'mutation' && orgId === 'aGhostOrg') return true

      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser) return new GraphQLError('Viewer is not on Organization')
      if (context.resourceGrants && !(await context.resourceGrants.hasOrg(orgId))) {
        return new GraphQLError(`PAT does not grant access to this organization`)
      }
      return true
    }
  )
