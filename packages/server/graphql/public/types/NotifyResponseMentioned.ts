import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {NotifyResponseMentionedResolvers} from '../resolverTypes'

const NotifyResponseMentioned: NotifyResponseMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  },
  response: ({responseId}, _args, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  }
}

export default NotifyResponseMentioned
