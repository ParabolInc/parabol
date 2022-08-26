import NotificationResponseMentioned from '../../../database/types/NotificationResponseMentioned'
import {NotifyResponseMentionedResolvers, ResolversTypes} from '../resolverTypes'

export type NotifyResponseMentionedSource = Pick<
  NotificationResponseMentioned,
  keyof NotificationResponseMentioned
>

const NotifyResponseMentioned: NotifyResponseMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as ResolversTypes['TeamPromptMeeting']
  },
  response: ({responseId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  }
}

export default NotifyResponseMentioned
