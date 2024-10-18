import {NotifyResponseMentionedResolvers} from '../resolverTypes'

const NotifyResponseMentioned: NotifyResponseMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Meeting is not a team prompt')
    return meeting
  },
  response: ({responseId}, _args, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  }
}

export default NotifyResponseMentioned
