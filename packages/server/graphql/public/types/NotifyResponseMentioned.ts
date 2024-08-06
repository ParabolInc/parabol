import TeamPromptResponseId from '../../../../client/shared/gqlIds/TeamPromptResponseId'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {NotifyResponseMentionedResolvers} from '../resolverTypes'

const NotifyResponseMentioned: NotifyResponseMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingTeamPrompt
  },
  response: ({responseId}, _args, {dataLoader}) => {
    // Hack, in a perfect world, this notification would have the numeric DB ID saved on it
    const dbId = TeamPromptResponseId.split(responseId)
    return dataLoader.get('teamPromptResponses').loadNonNull(dbId)
  }
}

export default NotifyResponseMentioned
