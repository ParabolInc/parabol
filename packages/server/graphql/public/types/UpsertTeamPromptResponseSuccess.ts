import NotificationResponseMentioned from '../../../database/types/NotificationResponseMentioned'
import {getUserId} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'
import {UpsertTeamPromptResponseSuccessResolvers} from '../resolverTypes'

export type UpsertTeamPromptResponseSuccessSource = {
  teamPromptResponseId: string
  meetingId: string
  addedNotificationIds: string[]
}

const UpsertTeamPromptResponseSuccess: UpsertTeamPromptResponseSuccessResolvers = {
  teamPromptResponse: async (source, _args, {dataLoader}) => {
    const {teamPromptResponseId} = source
    return dataLoader.get('teamPromptResponses').loadNonNull(teamPromptResponseId)
  },
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    return dataLoader.get('newMeetings').load(meetingId)
  },
  addedNotification: async (source, _args, {dataLoader, authToken}) => {
    const {addedNotificationIds} = source
    const viewerId = getUserId(authToken)
    const notifications = (
      await dataLoader.get('notifications').loadMany(addedNotificationIds)
    ).filter(errorFilter) as NotificationResponseMentioned[]
    return notifications.find((notification) => notification.userId === viewerId)!
  }
}

export default UpsertTeamPromptResponseSuccess
