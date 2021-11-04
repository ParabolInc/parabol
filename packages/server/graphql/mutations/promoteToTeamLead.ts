import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import PromoteToTeamLeadPayload from '../types/PromoteToTeamLeadPayload'
import {getUserId, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'

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

    // AUTH
    const viewerId = getUserId(authToken)
    const {teamId} = fromTeamMemberId(teamMemberId)
    const myTeamMemberId = toTeamMemberId(teamId, viewerId)
    if (!(await isTeamLead(viewerId, teamId))) {
      return standardError(new Error('Not team lead'), {userId: viewerId})
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
        .get(myTeamMemberId)
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

    const data = {teamId, oldLeaderId: myTeamMemberId, newLeaderId: teamMemberId}
    publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
    return data
  }
}
