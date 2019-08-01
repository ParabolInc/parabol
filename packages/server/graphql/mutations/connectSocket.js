import adjustUserCount from '../../billing/helpers/adjustUserCount'
import getRethink from '../../database/rethinkDriver'
import User from '../types/User'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {UNPAUSE_USER} from '../../utils/serverConstants'
import {NOTIFICATION} from '../../../client/utils/constants'
import sendSegmentEvent from '../../utils/sendSegmentEvent'

export default {
  name: 'ConnectSocket',
  description: 'a server-side mutation called when a client connects',
  type: User,
  resolve: async (source, args, {authToken, dataLoader, socketId}) => {
    const r = getRethink()
    const now = new Date()

    // AUTH
    if (!socketId) {
      throw new Error('Called connect without a valid socket')
    }
    const userId = getUserId(authToken)

    // RESOLUTION
    const userChanges = await r
      .table('User')
      .get(userId)
      .update(
        (user) => ({
          inactive: false,
          updatedAt: now,
          lastSeenAt: now,
          connectedSockets: user('connectedSockets')
            .default([])
            .append(socketId)
        }),
        {returnChanges: true}
      )('changes')(0)
      .default({})

    const {old_val: oldUser, new_val: user} = userChanges
    const {inactive} = oldUser
    const {connectedSockets, tms} = user

    // no need to wait for this, it's just for billing
    if (inactive) {
      const orgIds = await r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({removedAt: null, inactive: true})('orgId')
      adjustUserCount(userId, orgIds, UNPAUSE_USER)
      // TODO: re-identify
    }

    if (connectedSockets.length === 1) {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId: socketId, operationId}
      const listeningUserIds = await r
        .table('TeamMember')
        .getAll(r.args(tms), {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .distinct()

      // Tell everyone this user is now online
      listeningUserIds.forEach((onlineUserId) => {
        publish(NOTIFICATION, onlineUserId, User, user, subOptions)
      })
    }

    sendSegmentEvent('Connect WebSocket', userId, {
      connectedSockets,
      socketId,
      tms
    })
    return user
  }
}
