import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
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
    const viewerId = getUserId(authToken)
    const archivedNotification = (await dataLoader.get('notifications').loadMany(notificationIds))
      .filter(isValid)
      .filter((notification) => notification.type === 'TEAM_ARCHIVED')
      .find((notification) => notification.userId === viewerId)
    if (!archivedNotification) return null
    return archivedNotification
  }
}

export default ArchiveTeamPayload
