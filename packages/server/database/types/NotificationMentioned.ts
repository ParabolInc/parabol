import Notification from './Notification'

interface Input {
  userId: string
  name: string | null
  picture: string | null
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
  name: string | null
  picture: string | null
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
      name,
      picture,
      senderUserId,
      meetingName,
      meetingId,
      retroReflectionId,
      retroDiscussStageIdx,
      kudosEmoji,
      kudosEmojiUnicode
    } = input
    super({userId, type: 'MENTIONED'})
    this.name = name
    this.picture = picture
    this.senderUserId = senderUserId
    this.meetingName = meetingName
    this.meetingId = meetingId
    this.retroReflectionId = retroReflectionId
    this.kudosEmoji = kudosEmoji
    this.kudosEmojiUnicode = kudosEmojiUnicode
    this.retroDiscussStageIdx = retroDiscussStageIdx
  }
}
