import TeamPromptResponseId from '../../../../client/shared/gqlIds/TeamPromptResponseId'
import {NotifyResponseMentionedResolvers} from '../resolverTypes'

const NotifyResponseMentioned: NotifyResponseMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Meeting is not a team prompt')
    return meeting
  },
  response: ({responseId}, _args, {dataLoader}) => {
    // Hack, in a perfect world, this notification would have the numeric DB ID saved on it
    const dbId = TeamPromptResponseId.split(responseId)
    return dataLoader.get('teamPromptResponses').loadNonNull(dbId)
  }
}

export default NotifyResponseMentioned
