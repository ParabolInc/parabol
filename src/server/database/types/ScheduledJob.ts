import shortid from 'shortid'

export type ScheduledJobType = 'MEETING_STAGE_TIME_LIMIT'

export default abstract class ScheduledJob {
  id = shortid.generate()
  protected constructor (public type: ScheduledJobType, public runAt: Date) {}
}
