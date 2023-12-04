import Notification from './Notification'

interface Input {
  responseId: string
  meetingId: string
  userId: string
  kudosEmoji?: string | null
  kudosEmojiUnicode?: string | null
}

export default class NotificationResponseMentioned extends Notification {
  readonly type = 'RESPONSE_MENTIONED'
  responseId: string
  meetingId: string
  kudosEmoji?: string | null
  kudosEmojiUnicode?: string | null

  constructor(input: Input) {
    const {responseId, meetingId, userId, kudosEmoji, kudosEmojiUnicode} = input
    super({userId, type: 'RESPONSE_MENTIONED'})
    this.responseId = responseId
    this.meetingId = meetingId
    this.kudosEmoji = kudosEmoji
    this.kudosEmojiUnicode = kudosEmojiUnicode
  }
}
