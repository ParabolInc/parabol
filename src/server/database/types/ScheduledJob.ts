import shortid from 'shortid'

export type ScheduledJobType = 'MeetingStageTimeLimit'

export default abstract class ScheduledJob {
  id = shortid.generate()
  protected constructor (public type: ScheduledJobType, public runAt: Date) {}
}
