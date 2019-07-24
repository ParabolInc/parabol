import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {NOTIFICATION} from '../../../universal/utils/constants'
import DisconnectSocketPayload from '../types/DisconnectSocketPayload'
import promoteFirstTeamMember from './helpers/promoteFirstTeamMember'
import {MEETING_FACILITATOR_ELECTION_TIMEOUT} from '../../utils/serverConstants'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import findStageById from '../../../universal/utils/meetings/findStageById'
import Meeting from '../../database/types/Meeting'
import {GQLContext} from '../graphql'

export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: DisconnectSocketPayload,
  resolve: async (_source, _args, {authToken, dataLoader, socketId}: GQLContext) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const r = getRethink()

    // AUTH
    if (!socketId) return undefined
    const userId = getUserId(authToken)

    // RESOLUTION
    const disconnectedUser = await r
      .table('User')
      .get(userId)
      .update(
        (user) => ({
          connectedSockets: user('connectedSockets')
            .default([])
            .difference([socketId])
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)

    if (!disconnectedUser) return undefined
    const {connectedSockets, tms} = disconnectedUser
    const data = {user: disconnectedUser}
    if (connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      const {listeningUserIds, facilitatingMeetings} = await r({
        listeningUserIds: r
          .table('TeamMember')
          .getAll(r.args(tms), {index: 'teamId'})
          .filter({isNotRemoved: true})('userId')
          .distinct(),
        facilitatingMeetings: r
          .table('NewMeeting')
          .getAll(userId, {index: 'facilitatorUserId'})
          .coerceTo('array')
          .default([])
      })
      const operationId = dataLoader.share()
      const subOptions = {mutatorId: socketId, operationId}
      listeningUserIds.forEach((onlineUserId) => {
        publish(NOTIFICATION, onlineUserId, DisconnectSocketPayload, data, subOptions)
      })
      if (facilitatingMeetings.length > 0) {
        setTimeout(async () => {
          const userOffline = await r
            .table('User')
            .get(userId)('connectedSockets')
            .count()
            .eq(0)
            .default(true)
          if (userOffline) {
            facilitatingMeetings.forEach((meeting) => {
              const {phases, facilitatorStageId, id: meetingId, teamId} = meeting as Meeting
              const {stage} = findStageById(phases, facilitatorStageId)!
              if (!stage.isAsync) {
                promoteFirstTeamMember(meetingId, teamId, userId, subOptions).catch(console.error)
              }
            })
          }
        }, MEETING_FACILITATOR_ELECTION_TIMEOUT)
      }
    }
    sendSegmentEvent('Disconnect WebSocket', userId, {
      connectedSockets,
      socketId,
      tms
    }).catch()
    return data
  }
}
