import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import {getUserId, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import removeTeamMember from './helpers/removeTeamMember'

export default {
  type: new GraphQLObjectType({
    name: 'RemoveTeamMemberPayload',
    fields: {}
  }),
  description: 'Remove a team member from the team',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId of the person who is being removed'
    }
  },
  async resolve(
    _source: unknown,
    {teamMemberId}: {teamMemberId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const {userId, teamId} = fromTeamMemberId(teamMemberId)
    const isSelf = viewerId === userId
    if (!isSelf) {
      if (!(await isTeamLead(viewerId, teamId))) {
        return standardError(new Error('Not team lead'), {userId: viewerId})
      }
    }

    // RESOLUTION
    const evictorUserId = isSelf ? undefined : viewerId
    const res = await removeTeamMember(teamMemberId, {evictorUserId}, dataLoader)
    const {user, notificationId, archivedTaskIds, reassignedTaskIds} = res
    if (!user) {
      return standardError(new Error('Could not remove given team member'), {userId})
    }
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const {tms} = user
    publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms})
    const taskIds = [...archivedTaskIds, ...reassignedTaskIds]
    const data = {
      teamId,
      teamMemberId,
      taskIds,
      notificationId,
      userId
    }
    // messages to the rest of the team reporting the kick out
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveTeamMemberPayload', data, subOptions)
    teamMembers.forEach(({userId: teamMemberUserId}) => {
      // don't send updated tasks to the person being kicked out
      if (teamMemberUserId === userId) return
      publish(
        SubscriptionChannel.TASK,
        teamMemberUserId,
        'RemoveTeamMemberPayload',
        data,
        subOptions
      )
    })

    // individualized message to the user getting kicked out
    publish(SubscriptionChannel.TEAM, userId, 'RemoveTeamMemberPayload', data, subOptions)

    return data
  }
}
