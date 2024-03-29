import Notification from './Notification'

interface Input {
  userId: string
  name: string | null
  picture: string | null
  senderUserId: string
  meetingName: string
  meetingId: string
  emoji: string
  emojiUnicode: string
}

export default class NotificationKudosReceived extends Notification {
  readonly type = 'KUDOS_RECEIVED'
  name: string | null
  picture: string | null
  senderUserId: string
  meetingName: string
  meetingId: string
  emoji: string
  emojiUnicode: string

  constructor(input: Input) {
    const {userId, name, picture, senderUserId, meetingName, meetingId, emoji, emojiUnicode} = input
    super({userId, type: 'KUDOS_RECEIVED'})
    this.name = name
    this.picture = picture
    this.senderUserId = senderUserId
    this.meetingName = meetingName
    this.meetingId = meetingId
    this.emoji = emoji
    this.emojiUnicode = emojiUnicode
  }
}
