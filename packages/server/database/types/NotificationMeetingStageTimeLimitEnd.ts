import Notification from './Notification'
import {NotificationEnum} from 'parabol-client/types/graphql'

interface Input {
  meetingId: string
  userId: string
}

export default class NotificationMeetingStageTimeLimitEnd extends Notification {
  meetingId: string
  constructor(input: Input) {
    const {meetingId, userId} = input
    super({userId, type: NotificationEnum.MEETING_STAGE_TIME_LIMIT_END})
    this.meetingId = meetingId
  }
}
