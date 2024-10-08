import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {NotifyResponseRepliedResolvers} from '../resolverTypes'

const NotifyResponseReplied: NotifyResponseRepliedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_REPLIED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Meeting is not a team prompt')
    return meeting
  },
  response: async ({userId, meetingId}) => {
    // TODO: implement getTeamPromptResponsesByMeetingIdAndUserId
    const responses = await getTeamPromptResponsesByMeetingId(meetingId)
    return responses.find(({userId: responseUserId}) => responseUserId === userId)!
  },
  author: async ({authorId, commentId}, _args: unknown, {dataLoader}) => {
    const comment = await dataLoader.get('comments').loadNonNull(commentId)
    if (comment.isAnonymous) return null

    return dataLoader.get('users').loadNonNull(authorId)
  },
  comment: ({commentId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('comments').loadNonNull(commentId)
  }
}

export default NotifyResponseReplied
