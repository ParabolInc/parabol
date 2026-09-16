import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

/**
 * Allows a mutation over one or many teams when, for EACH team, the viewer is either on the team
 * or a billing leader / org admin of the team's organization.
 *
 * `or(isTeamMember, isViewerBillingLeader)` cannot express this: each rule sees the whole list, so
 * a mix of teams the viewer is on and teams they merely lead fails both rules.
 */
export const isTeamMemberOrOrgLeader = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isTeamMemberOrOrgLeader-${dotPath}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const {authToken, dataLoader, resourceGrants} = context
      const viewerId = getUserId(authToken)
      const argVar = getResolverDotPath(dotPath, source, args)
      const teamIds = (Array.isArray(argVar) ? argVar : [argVar]) as string[]

      for (const teamId of new Set(teamIds)) {
        if (authToken.tms?.includes(teamId)) {
          if (resourceGrants && !(await resourceGrants.hasTeam(teamId))) {
            return new GraphQLError(`PAT does not grant access to this team`)
          }
          continue
        }
        const team = await dataLoader.get('teams').load(teamId)
        if (!team) return new GraphQLError(`Team not found`)
        const {orgId} = team
        const organizationUser = await dataLoader
          .get('organizationUsersByUserIdOrgId')
          .load({orgId, userId: viewerId})
        const role = organizationUser?.role
        if (role !== 'BILLING_LEADER' && role !== 'ORG_ADMIN') {
          return new GraphQLError(`Viewer is not on team`)
        }
        if (resourceGrants && !(await resourceGrants.hasOrg(orgId))) {
          return new GraphQLError(`PAT does not grant access to this organization`)
        }
      }
      return true
    }
  )
