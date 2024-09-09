import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import getKysely from '../../postgres/getKysely'
import {getUserId, isSuperUser, isUserOrgAdmin} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import PromoteToTeamLeadPayload from '../types/PromoteToTeamLeadPayload'

export default {
  type: PromoteToTeamLeadPayload,
  description: 'Promote another team member to be the leader',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Team id of the team which is about to get a new team leader'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'userId who will be set as a new team leader'
    }
  },
  async resolve(
    _source: unknown,
    {teamId, userId}: {teamId: string; userId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const [teamMembers, team] = await Promise.all([
      dataLoader.get('teamMembersByTeamId').load(teamId),
      dataLoader.get('teams').loadNonNull(teamId)
    ])
    const oldLead = teamMembers.find(({isLead}) => isLead)
    if (!oldLead) {
      return standardError(new Error('Team has no team lead'), {userId: viewerId})
    }
    const {id: oldLeadTeamMemberId} = oldLead
    if (!isSuperUser(authToken)) {
      const isOrgAdmin = await isUserOrgAdmin(viewerId, team.orgId, dataLoader)
      const viewerTeamMemberId = TeamMemberId.join(teamId, viewerId)
      if (viewerTeamMemberId !== oldLeadTeamMemberId && !isOrgAdmin) {
        return standardError(new Error('Not team lead or org admin'), {userId: viewerId})
      }
    }

    // VALIDATION
    const promoteeOnTeam = teamMembers.find((teamMember) => teamMember.userId === userId)
    if (!promoteeOnTeam) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await pg
      .updateTable('TeamMember')
      .set(({not}) => ({isLead: not('isLead')}))
      .where('id', 'in', [oldLeadTeamMemberId, promoteeOnTeam.id])
      .execute()
    dataLoader.clearAll('teamMembers')

    const data = {teamId, oldLeaderId: oldLeadTeamMemberId, newLeaderId: promoteeOnTeam.id}
    publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
    return data
  }
}
