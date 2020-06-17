import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import db from '../../../db'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {GQLContext} from '../../graphql'
import DisconnectSocketPayload from '../../types/DisconnectSocketPayload'

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
    const reqlUpdater = (user) => ({
      lastSeenAtURL: r.branch(
        user('connectedSockets')
          .count()
          .eq(0),
        null,
        user('lastSeenAtURL')
      ),
      connectedSockets: user('connectedSockets')
        .default([])
        .difference([socketId])
    })
    const user = await db.write('User', userId, reqlUpdater)
    const {tms, connectedSockets} = user
    const data = {user}
    if (connectedSockets.length === 0) {
      // If that was the last socket, tell everyone they went offline
      const listeningUserIds = await r
        .table('TeamMember')
        .getAll(r.args(tms), {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .distinct()
        .run()
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
    segmentIo.track({
      userId,
      event: 'Disconnect WebSocket',
      properties: {
        connectedSockets,
        socketId,
        tms
      }
    })
    return data
  }
}
