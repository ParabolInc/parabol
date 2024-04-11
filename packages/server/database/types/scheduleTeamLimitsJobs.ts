import ms from 'ms'
import {Threshold} from '../../../client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import ScheduledTeamLimitsJob from './ScheduledTeamLimitsJob'

const scheduleTeamLimitsJobs = async (scheduledLockAt: Date, orgId: string) => {
  const pg = getKysely()
  const scheduledLock = pg
    .insertInto('ScheduledJob')
    .values(new ScheduledTeamLimitsJob(scheduledLockAt, orgId, 'LOCK_ORGANIZATION'))
    .execute()

  const oneWeekBeforeLock = new Date(
    scheduledLockAt.getTime() - ms(`${Threshold.FINAL_WARNING_DAYS_BEFORE_LOCK}d`)
  )

  const scheduledWarn = pg
    .insertInto('ScheduledJob')
    .values(new ScheduledTeamLimitsJob(oneWeekBeforeLock, orgId, 'WARN_ORGANIZATION'))
    .execute()

  await Promise.all([scheduledLock, scheduledWarn])
}

export default scheduleTeamLimitsJobs
