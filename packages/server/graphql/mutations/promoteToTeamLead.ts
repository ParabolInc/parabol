import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isSuperUser} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import PromoteToTeamLeadPayload from '../types/PromoteToTeamLeadPayload'

export default {
  type: PromoteToTeamLeadPayload,
  description: 'Promote another team member to be the leader',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the new team member that will be the leader'
    }
  },
  async resolve(
    _source: unknown,
    {teamMemberId}: {teamMemberId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const {teamId} = TeamMemberId.split(teamMemberId)

    // AUTH
    const oldLeadTeamMemberId = await r
      .table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({isNotRemoved: true, isLead: true})
      .nth(0)('id')
      .default(null)
      .run()

    if (!isSuperUser(authToken)) {
      const viewerTeamMemberId = TeamMemberId.join(teamId, viewerId)
      if (viewerTeamMemberId !== oldLeadTeamMemberId) {
        return standardError(new Error('Not team lead'), {userId: viewerId})
      }
    }

    // VALIDATION
    const promoteeOnTeam = await r
      .table('TeamMember')
      .get(teamMemberId)
      .run()
    if (!promoteeOnTeam || !promoteeOnTeam.isNotRemoved) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r({
      teamLead: r
        .table('TeamMember')
        .get(oldLeadTeamMemberId)
        .update({
          isLead: false
        }),
      promotee: r
        .table('TeamMember')
        .get(teamMemberId)
        .update({
          isLead: true
        })
    }).run()

    const data = {teamId, oldLeaderId: oldLeadTeamMemberId, newLeaderId: teamMemberId}
    publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
    return data
  }
}
