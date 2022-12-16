import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {NotifyResponseMentionedResolvers} from '../resolverTypes'

const NotifyResponseMentioned: NotifyResponseMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingTeamPrompt
  },
  response: ({responseId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  }
}

export default NotifyResponseMentioned
