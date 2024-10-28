import {Selectable} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import ScheduledJobMeetingStageTimeLimit from '../../../database/types/ScheduledJobMetingStageTimeLimit'
import ScheduledTeamLimitsJob from '../../../database/types/ScheduledTeamLimitsJob'
import processTeamsLimitsJob from '../../../database/types/processTeamsLimitsJob'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {DB} from '../../../postgres/types/pg'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'

const processMeetingStageTimeLimits = async (
  job: ScheduledJobMeetingStageTimeLimit,
  dataLoader: DataLoaderWorker
) => {
  // get the meeting
  // get the facilitator
  // see if the facilitator has turned on slack notifications for the meeting
  // detect integrated services
  // if slack, send slack
  // if mattermost, send mattermost
  // if no integrated notification services, send an in-app notification
  const {meetingId} = job
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId, facilitatorUserId} = meeting
  IntegrationNotifier.endTimeLimit(dataLoader, meetingId, teamId)

  const notification = {
    id: generateUID(),
    type: 'MEETING_STAGE_TIME_LIMIT_END' as const,
    meetingId,
    userId: facilitatorUserId!
  }
  const pg = getKysely()
  await pg.insertInto('Notification').values(notification).execute()
  publish(SubscriptionChannel.NOTIFICATION, facilitatorUserId!, 'MeetingStageTimeLimitPayload', {
    notification
  })
}

const processJob = async (job: Selectable<DB['ScheduledJob']>, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const res = await pg.deleteFrom('ScheduledJob').where('id', '=', job.id).executeTakeFirst()
  // prevent duplicates. after this point, we assume the job finishes to completion (ignores server crashes, etc.)
  if (res.numDeletedRows !== BigInt(1)) return

  if (job.type === 'MEETING_STAGE_TIME_LIMIT_END') {
    return processMeetingStageTimeLimits(
      job as ScheduledJobMeetingStageTimeLimit,
      dataLoader
    ).catch(Logger.error)
  } else if (job.type === 'LOCK_ORGANIZATION' || job.type === 'WARN_ORGANIZATION') {
    return processTeamsLimitsJob(job as ScheduledTeamLimitsJob, dataLoader).catch(Logger.error)
  }
}

const runScheduledJobs: MutationResolvers['runScheduledJobs'] = async (
  _source,
  {seconds},
  {dataLoader}
) => {
  const pg = getKysely()
  const now = new Date()

  // RESOLUTION
  const before = new Date(now.getTime() + seconds * 1000)
  const upcomingJobs = await pg
    .selectFrom('ScheduledJob')
    .selectAll()
    .where('runAt', '<', before)
    .execute()

  upcomingJobs.forEach((job) => {
    const {runAt} = job
    const timeout = Math.max(0, runAt.getTime() - now.getTime())
    setTimeout(() => {
      processJob(job, dataLoader).catch(Logger.error)
    }, timeout)
  })

  return upcomingJobs.length
}

export default runScheduledJobs
