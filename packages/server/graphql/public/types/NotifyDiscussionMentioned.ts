import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {NotifyDiscussionMentionedResolvers} from '../resolverTypes'

const NotifyDiscussionMentioned: NotifyDiscussionMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'DISCUSSION_MENTIONED',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingTeamPrompt
  },
  author: ({authorId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(authorId)
  },
  comment: ({commentId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('comments').load(commentId)
  },
  discussion: ({discussionId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('discussions').loadNonNull(discussionId)
  }
}

export default NotifyDiscussionMentioned
