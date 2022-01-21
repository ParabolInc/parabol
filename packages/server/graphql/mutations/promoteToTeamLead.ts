import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isSuperUser} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import GraphQLEmailType from '../types/GraphQLEmailType'
import PromoteToTeamLeadPayload from '../types/PromoteToTeamLeadPayload'

export default {
  type: PromoteToTeamLeadPayload,
  description: 'Promote another team member to be the leader',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Team id of the team which is about to get a new team leader'
    },
    newTeamLeadEmail: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'Email of the user who will be set as a new team leader'
    }
  },
  async resolve(
    _source: unknown,
    {teamId, newTeamLeadEmail}: {teamId: string; newTeamLeadEmail: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

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
      .getAll(teamId, {index: 'teamId'})
      .filter({email: newTeamLeadEmail, isNotRemoved: true})
      .nth(0)
      .default(null)
      .run()
    if (!promoteeOnTeam) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r({
      teamLead: r.table('TeamMember').get(oldLeadTeamMemberId).update({
        isLead: false
      }),
      promotee: r.table('TeamMember').get(promoteeOnTeam.id).update({
        isLead: true
      })
    }).run()

    const data = {teamId, oldLeaderId: oldLeadTeamMemberId, newLeaderId: promoteeOnTeam.id}
    publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
    return data
  }
}
