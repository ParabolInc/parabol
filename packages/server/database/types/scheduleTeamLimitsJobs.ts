import ms from 'ms'
import {r} from 'rethinkdb-ts'
import {Threshold} from '../../../client/types/constEnums'
import ScheduledTeamLimitsJob from './ScheduledTeamLimitsJob'

const scheduleTeamLimitsJobs = async (scheduledLockAt: Date, orgId: string) => {
  const scheduledLock = r
    .table('ScheduledJob')
    .insert(new ScheduledTeamLimitsJob(scheduledLockAt, orgId, 'LOCK_ORGANIZATION'))
    .run()

  const oneWeekBeforeLock = new Date(
    scheduledLockAt.getTime() - ms(`${Threshold.FINAL_WARNING_DAYS_BEFORE_LOCK}d`)
  )
  const scheduledWarn = r
    .table('ScheduledJob')
    .insert(new ScheduledTeamLimitsJob(oneWeekBeforeLock, orgId, 'WARN_ORGANIZATION'))
    .run()

  await Promise.all([scheduledLock, scheduledWarn])
}

export default scheduleTeamLimitsJobs
