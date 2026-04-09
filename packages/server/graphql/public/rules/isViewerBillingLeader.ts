import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isViewerBillingLeader = <T>(
  orgIdDotPath: ResolverDotPath<T>,
  dataLoaderName?: AllPrimaryLoaders
) =>
  rule(`isViewerBillingLeader-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const {authToken, dataLoader} = context
      const argVar = getResolverDotPath(orgIdDotPath, source, args)
      let orgId: string = argVar
      if (dataLoaderName) {
        const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
        if (!subject?.orgId)
          return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
        orgId = subject.orgId
      }
      const viewerId = getUserId(authToken)
      const organizationUser = await dataLoader
        .get('organizationUsersByUserIdOrgId')
        .load({orgId, userId: viewerId})
      if (!organizationUser) return new GraphQLError('Viewer is not on Organization')
      const {role} = organizationUser
      if (role !== 'BILLING_LEADER' && role !== 'ORG_ADMIN')
        return new GraphQLError('User is not billing leader')
      if (context.resourceGrants && !(await context.resourceGrants.hasOrg(orgId))) {
        return new GraphQLError(`PAT does not grant access to this organization`)
      }
      return true
    }
  )
