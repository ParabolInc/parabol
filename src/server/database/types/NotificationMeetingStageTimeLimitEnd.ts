import Notification from './Notification'

interface Input {
  meetingId: string
  userIds: string[]
}

export default class NotificationMeetingStageTimeLimitEnd extends Notification {
  meetingId: string
  constructor (input: Input) {
    const {meetingId, userIds} = input
    super({userIds, type: 'MEETING_STAGE_TIME_LIMIT_END'})
    this.meetingId = meetingId
  }
}
