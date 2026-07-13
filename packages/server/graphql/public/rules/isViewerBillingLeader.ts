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
      const viewerId = getUserId(authToken)
      const argVar = getResolverDotPath(orgIdDotPath, source, args)
      // the path may resolve to a single id or an array of ids
      const argVars = (Array.isArray(argVar) ? argVar : [argVar]) as string[]

      const orgIds = new Set<string>()
      if (dataLoaderName) {
        const subjects = await dataLoader.get(dataLoaderName as any).loadMany(argVars)
        for (let i = 0; i < subjects.length; i++) {
          const subject = subjects[i]
          if (!subject || subject instanceof Error || !subject.orgId)
            return new GraphQLError(
              `Permission lookup failed on ${dataLoaderName} for ${argVars[i]}`
            )
          orgIds.add(subject.orgId)
        }
      } else {
        argVars.forEach((id) => orgIds.add(id))
      }

      // the viewer must be a billing leader / org admin of every resolved organization
      for (const orgId of orgIds) {
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
      }
      return true
    }
  )
