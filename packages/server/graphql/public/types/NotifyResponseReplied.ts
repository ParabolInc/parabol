import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {NotifyResponseRepliedResolvers, ResolversTypes} from '../resolverTypes'

const NotifyResponseReplied: NotifyResponseRepliedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_REPLIED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as ResolversTypes['TeamPromptMeeting']
  },
  response: async ({userId, meetingId}, _args: unknown, {dataLoader}) => {
    // TODO: implement getTeamPromptResponsesByMeetingIdAndUserId
    const responses = await getTeamPromptResponsesByMeetingId(meetingId)
    return responses.find(({userId: responseUserId}) => responseUserId === userId)!
  },
  author: ({authorId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(authorId)
  },
  comment: ({commentId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('comments').load(commentId)
  }
}

export default NotifyResponseReplied
