import Notification from './Notification'

interface Input {
  userId: string
  senderName: string | null
  senderPicture: string | null
  senderUserId: string
  meetingName: string
  meetingId: string
  retroReflectionId?: string | null
  retroDiscussStageIdx?: number | null
  kudosEmoji?: string | null
  kudosEmojiUnicode?: string | null
}

export default class NotificationMentioned extends Notification {
  readonly type = 'MENTIONED'
  senderName: string | null
  senderPicture: string | null
  senderUserId: string
  meetingName: string
  meetingId: string
  retroReflectionId?: string | null
  retroDiscussStageIdx?: number | null
  kudosEmoji?: string | null
  kudosEmojiUnicode?: string | null

  constructor(input: Input) {
    const {
      userId,
      senderName,
      senderPicture,
      senderUserId,
      meetingName,
      meetingId,
      retroReflectionId,
      retroDiscussStageIdx,
      kudosEmoji,
      kudosEmojiUnicode
    } = input
    super({userId, type: 'MENTIONED'})
    this.senderName = senderName
    this.senderPicture = senderPicture
    this.senderUserId = senderUserId
    this.meetingName = meetingName
    this.meetingId = meetingId
    this.retroReflectionId = retroReflectionId
    this.kudosEmoji = kudosEmoji
    this.kudosEmojiUnicode = kudosEmojiUnicode
    this.retroDiscussStageIdx = retroDiscussStageIdx
  }
}
