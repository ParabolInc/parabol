import {NotifyDiscussionMentionedResolvers} from '../resolverTypes'

const NotifyDiscussionMentioned: NotifyDiscussionMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'DISCUSSION_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting
  },
  author: async ({authorId, commentId}, _args: unknown, {dataLoader}) => {
    const comment = await dataLoader.get('comments').loadNonNull(commentId)
    if (comment.isAnonymous) return null

    return dataLoader.get('users').loadNonNull(authorId)
  },
  comment: ({commentId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('comments').loadNonNull(commentId)
  },
  discussion: ({discussionId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('discussions').loadNonNull(discussionId)
  }
}

export default NotifyDiscussionMentioned
