import {GraphQLID, GraphQLNonNull} from 'graphql'
import removeTeamMember from './helpers/removeTeamMember'
import RemoveTeamMemberPayload from '../types/RemoveTeamMemberPayload'
import {auth0ManagementClient} from '../../utils/auth0Helpers'
import {getUserId, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import {NEW_AUTH_TOKEN, TASK, TEAM, UPDATED} from '../../../client/utils/constants'
import fromTeamMemberId from '../../../client/utils/relay/fromTeamMemberId'
import standardError from '../../utils/standardError'

export default {
  type: RemoveTeamMemberPayload,
  description: 'Remove a team member from the team',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId of the person who is being removed'
    }
  },
  async resolve (source, {teamMemberId}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const isKickout = !isSelf
    const res = await removeTeamMember(teamMemberId, {isKickout}, dataLoader)
    const {user, removedNotifications, notificationId, archivedTaskIds, reassignedTaskIds} = res

    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const {tms} = user
    publish(NEW_AUTH_TOKEN, userId, UPDATED, {tms})
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})

    const taskIds = [...archivedTaskIds, ...reassignedTaskIds]
    const data = {
      teamId,
      teamMemberId,
      taskIds,
      notificationId,
      removedNotifications,
      userId
    }
    // messages to the rest of the team reporting the kick out
    publish(TEAM, teamId, RemoveTeamMemberPayload, data, subOptions)
    teamMembers.forEach(({teamMemberUserId}) => {
      // don't send updated tasks to the person being kicked out
      if (teamMemberUserId === userId) return
      publish(TASK, teamMemberUserId, RemoveTeamMemberPayload, data, subOptions)
    })

    // individualized message to the user getting kicked out
    publish(TEAM, userId, RemoveTeamMemberPayload, data, subOptions)

    return data
  }
}
