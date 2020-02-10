import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import NotificationTeamArchived from '../../database/types/NotificationTeamArchived'
import safeArchiveTeam from '../../safeMutations/safeArchiveTeam'
import {getUserId, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import standardError from '../../utils/standardError'
import ArchiveTeamPayload from '../types/ArchiveTeamPayload'

export default {
  type: GraphQLNonNull(ArchiveTeamPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(_source, {teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isTeamLead(viewerId, teamId))) {
      return standardError(new Error('Not team lead'), {userId: viewerId})
    }

    // RESOLUTION
    sendSegmentEvent('Archive Team', viewerId, {teamId}).catch()
    const {team, users, removedSuggestedActionIds} = await safeArchiveTeam(teamId)

    if (!team) {
      return standardError(new Error('Already archived team'), {userId: viewerId})
    }

    const notifications = users
      .map(({id}) => id)
      .filter((userId) => userId !== viewerId)
      .map(
        (notifiedUserId) =>
          new NotificationTeamArchived({userId: notifiedUserId, teamId, archivorUserId: viewerId})
      )

    if (notifications.length) {
      await r
        .table('Notification')
        .insert(notifications)
        .run()
    }

    const data = {
      teamId,
      notificationIds: notifications.map(({id}) => id),
      removedSuggestedActionIds
    }
    publish(SubscriptionChannel.TEAM, teamId, 'ArchiveTeamPayload', data, subOptions)

    users.forEach((user) => {
      const {id, tms} = user
      publish(SubscriptionChannel.NOTIFICATION, id, 'AuthTokenPayload', {tms})
    })

    return data
  }
}
