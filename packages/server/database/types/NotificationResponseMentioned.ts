import Notification from './Notification'

interface Input {
  responseId: string
  meetingId: string
  userId: string
}

export default class NotificationResponseMentioned extends Notification {
  responseId: string
  meetingId: string

  constructor(input: Input) {
    const {responseId, meetingId, userId} = input
    super({userId, type: 'RESPONSE_MENTIONED'})
    this.responseId = responseId
    this.meetingId = meetingId
  }
}
