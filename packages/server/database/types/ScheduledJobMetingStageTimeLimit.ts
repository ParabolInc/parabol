import ScheduledJob from './ScheduledJob'

export default class ScheduledJobMeetingStageTimeLimit extends ScheduledJob {
  constructor(public runAt: Date, public meetingId: string) {
    super('MEETING_STAGE_TIME_LIMIT_END', runAt)
  }
}
