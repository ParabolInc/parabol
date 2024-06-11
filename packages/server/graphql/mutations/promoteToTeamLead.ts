import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import getRethink from '../../database/rethinkDriver'
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
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const [oldLeadTeamMemberId, team] = await Promise.all([
      r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true, isLead: true})
        .nth(0)('id')
        .default(null)
        .run(),
      dataLoader.get('teams').loadNonNull(teamId)
    ])

    if (!isSuperUser(authToken)) {
      const isOrgAdmin = await isUserOrgAdmin(viewerId, team.orgId, dataLoader)
      const viewerTeamMemberId = TeamMemberId.join(teamId, viewerId)
      if (viewerTeamMemberId !== oldLeadTeamMemberId && !isOrgAdmin) {
        return standardError(new Error('Not team lead or org admin'), {userId: viewerId})
      }
    }

    // VALIDATION
    const promoteeOnTeam = await r
      .table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({userId, isNotRemoved: true})
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
