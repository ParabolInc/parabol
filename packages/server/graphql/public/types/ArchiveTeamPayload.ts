import NotificationTeamArchived from '../../../database/types/NotificationTeamArchived'
import {getUserId} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'
import {ArchiveTeamPayloadResolvers} from '../resolverTypes'

export type ArchiveTeamPayloadSource = {
  teamId: string
  notificationIds: string[]
  removedSuggestedActionIds: string[]
  teamTemplateIds: string[]
}

const ArchiveTeamPayload: ArchiveTeamPayloadResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  notification: async ({notificationIds}, _args, {authToken, dataLoader}) => {
    if (!notificationIds) return null
    const notifications = (await dataLoader.get('notifications').loadMany(notificationIds)).filter(
      errorFilter
    )
    const viewerId = getUserId(authToken)
    const archivedNotification = notifications.find(
      (notification) => notification.userId === viewerId
    )
    if (!archivedNotification) return null
    return archivedNotification as NotificationTeamArchived
  }
}

export default ArchiveTeamPayload
