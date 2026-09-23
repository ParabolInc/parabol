import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {NotifyResponseRepliedResolvers} from '../resolverTypes'

const NotifyResponseReplied: NotifyResponseRepliedResolvers = {
  __isTypeOf: ({type}) => type === 'RESPONSE_REPLIED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  },
  response: async ({userId, meetingId}, _args, {dataLoader}) => {
    const responses = await dataLoader
      .get('teamPromptResponsesByMeetingIdAndUserId')
      .load({meetingId, userId})
    return responses[0]!
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
