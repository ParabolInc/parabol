import {rule} from 'graphql-shield'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import {ResolverDotPath, getResolverDotPath} from './getResolverDotPath'

export const isViewerTeamLead = <T>(teamIdDotPath: ResolverDotPath<T>) =>
  rule(`isViewerTeamLead-${teamIdDotPath}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const teamId = getResolverDotPath(teamIdDotPath, source, args)
      const viewerId = getUserId(authToken)
      const teamMemberId = TeamMemberId.join(teamId, viewerId)
      const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
      if (!teamMember?.isLead) return new Error('User is not team lead')
      return true
    }
  )
