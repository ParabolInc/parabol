import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import ArchiveTeamPayload from '../types/ArchiveTeamPayload'
import {getUserId, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import shortid from 'shortid'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {NotificationEnum} from 'parabol-client/types/graphql'
import safeArchiveTeam from '../../safeMutations/safeArchiveTeam'

export default {
  type: ArchiveTeamPayload,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(_source, {teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isTeamLead(viewerId, teamId))) {
      return standardError(new Error('Not team lead'), {userId: viewerId})
    }

    // RESOLUTION
    sendSegmentEvent('Archive Team', viewerId, {teamId}).catch()
    const {
      team,
      users,
      removedTeamNotifications,
      removedSuggestedActionIds
    } = await safeArchiveTeam(teamId)

    if (!team) {
      return standardError(new Error('Already archived team'), {userId: viewerId})
    }

    const notifications = users
      .map(({id}) => id)
      .filter((userId) => userId !== viewerId)
      .map((notifiedUserId) => ({
        id: shortid.generate(),
        startAt: now,
        type: NotificationEnum.TEAM_ARCHIVED,
        userIds: [notifiedUserId],
        teamId
      }))
    if (notifications.length) {
      await r
        .table('Notification')
        .insert(notifications)
        .run()
    }

    const data = {
      teamId,
      notificationIds: notifications.map(({id}) => id),
      removedTeamNotifications,
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
