import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import DisconnectSocketPayload from '../../types/DisconnectSocketPayload'
import sendSegmentEvent from '../../../utils/sendSegmentEvent'
import {GQLContext} from '../../graphql'
import {SubscriptionChannel} from 'parabol-client/lib/types/constEnums'

export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: DisconnectSocketPayload,
  resolve: async (_source, _args, {authToken, socketId}: GQLContext) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const r = await getRethink()

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
      .run()

    if (!disconnectedUser) return undefined
    const {connectedSockets, tms} = disconnectedUser
    const data = {user: disconnectedUser}
    if (connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      const {listeningUserIds} = await r({
        listeningUserIds: (r
          .table('TeamMember')
          .getAll(r.args(tms), {index: 'teamId'})
          .filter({isNotRemoved: true})('userId')
          .distinct() as unknown) as string[],
        clearedLastSeen: r
          .table('User')
          .get(userId)
          .update({lastSeenAtURL: null})
      }).run()
      const subOptions = {mutatorId: socketId}
      listeningUserIds.forEach((onlineUserId) => {
        publish(
          SubscriptionChannel.NOTIFICATION,
          onlineUserId,
          'DisconnectSocketPayload',
          data,
          subOptions
        )
      })
    }
    sendSegmentEvent('Disconnect WebSocket', userId, {
      connectedSockets,
      socketId,
      tms
    }).catch()
    return data
  }
}
