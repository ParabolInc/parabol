import {GraphQLNonNull} from 'graphql'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import sendSegmentEvent from '../../../utils/sendSegmentEvent'
import {GQLContext} from '../../graphql'
import User from '../../types/User'

export default {
  name: 'ConnectSocket',
  description: 'a server-side mutation called when a client connects',
  type: GraphQLNonNull(User),
  resolve: async (_source, _args, {authToken, dataLoader, socketId}: GQLContext) => {
    const r = await getRethink()
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
          lastSeenAtURL: null,
          connectedSockets: user('connectedSockets')
            .default([])
            .append(socketId)
        }),
        {returnChanges: true}
      )('changes')(0)
      .default({})
      .run()

    const {old_val: oldUser, new_val: user} = userChanges
    const {inactive} = oldUser
    const {connectedSockets, tms} = user

    // no need to wait for this, it's just for billing
    if (inactive) {
      const orgIds = await r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({removedAt: null, inactive: true})('orgId')
        .run()
      adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER).catch(console.log)
      // TODO: re-identify
    }

    if (connectedSockets.length === 1) {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId: socketId, operationId}
      const listeningUserIds = (await r
        .table('TeamMember')
        .getAll(r.args(tms), {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .distinct()
        .run()) as string[]

      // Tell everyone this user is now online
      listeningUserIds.forEach((onlineUserId) => {
        publish(SubscriptionChannel.NOTIFICATION, onlineUserId, 'User', user, subOptions)
      })
    }

    sendSegmentEvent('Connect WebSocket', userId, {
      connectedSockets,
      socketId,
      tms
    }).catch()
    return user
  }
}
