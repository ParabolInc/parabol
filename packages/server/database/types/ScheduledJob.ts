export type ScheduledJobType =
  | 'MEETING_STAGE_TIME_LIMIT_END'
  | 'LOCK_ORGANIZATION'
  | 'WARN_ORGANIZATION'

export default abstract class ScheduledJob {
  protected constructor(
    public type: ScheduledJobType,
    public runAt: Date
  ) {}
}
