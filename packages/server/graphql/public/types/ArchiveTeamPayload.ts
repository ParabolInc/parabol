import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import type {ArchiveTeamPayloadResolvers} from '../resolverTypes'

export type ArchiveTeamPayloadSource =
  | {
      teamId: string
      notificationIds: string[]
      removedSuggestedActionIds: string[]
      teamTemplateIds: string[]
    }
  | {error: {message: string}}

const ArchiveTeamPayload: ArchiveTeamPayloadResolvers = {
  team: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('teams').loadNonNull(source.teamId)
  },
  notification: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const {notificationIds} = source
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
