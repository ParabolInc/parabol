import Notification from './Notification'

interface Input {
  meetingId: string
  authorId: string
  userId: string
  commentId: string
}

export default class NotificationResponseReplied extends Notification {
  meetingId: string
  authorId: string
  commentId: string

  constructor(input: Input) {
    const {meetingId, authorId, userId, commentId} = input
    super({userId, type: 'RESPONSE_REPLIED'})
    this.meetingId = meetingId
    this.authorId = authorId
    this.commentId = commentId
  }
}
