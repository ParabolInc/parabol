import Notification from './Notification'

interface Input {
  meetingId: string
  authorId: string
  userId: string
  commentId: string
  discussionId: string
}

export default class NotificationDiscussionMentioned extends Notification {
  meetingId: string
  authorId: string
  commentId: string
  discussionId: string

  constructor(input: Input) {
    const {meetingId, authorId, userId, commentId, discussionId} = input
    super({userId, type: 'DISCUSSION_MENTIONED'})
    this.meetingId = meetingId
    this.authorId = authorId
    this.commentId = commentId
    this.discussionId = discussionId
  }
}
