import ScheduledJob from 'server/database/types/ScheduledJob'

export default class ScheduledJobMeetingStageTimeLimit extends ScheduledJob {
  constructor (public runAt: Date, public meetingId: string) {
    super('MeetingStageTimeLimit', runAt)
  }
}
