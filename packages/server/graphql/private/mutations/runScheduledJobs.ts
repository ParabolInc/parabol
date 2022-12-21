import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {ValueOf} from '../../../../client/types/generics'
import getRethink from '../../../database/rethinkDriver'
import NotificationMeetingStageTimeLimitEnd from '../../../database/types/NotificationMeetingStageTimeLimitEnd'
import ScheduledJobMeetingStageTimeLimit from '../../../database/types/ScheduledJobMetingStageTimeLimit'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'
import {r} from 'rethinkdb-ts'
import ScheduledJobOrganizationLock from "../../../database/types/ScheduledJobOrganizationLock";

const processMeetingStageTimeLimits = async (
  job: ScheduledJobMeetingStageTimeLimit,
  {dataLoader}: {dataLoader: DataLoaderWorker}
) => {
  // get the meeting
  // get the facilitator
  // see if the facilitator has turned on slack notifications for the meeting
  // detect integrated services
  // if slack, send slack
  // if mattermost, send mattermost
  // if no integrated notification services, send an in-app notification
  const {meetingId} = job
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {teamId, facilitatorUserId} = meeting
  IntegrationNotifier.endTimeLimit(dataLoader, meetingId, teamId)

  const notification = new NotificationMeetingStageTimeLimitEnd({
    meetingId,
    userId: facilitatorUserId
  })
  const r = await getRethink()
  await r.table('Notification').insert(notification).run()
  publish(SubscriptionChannel.NOTIFICATION, facilitatorUserId, 'MeetingStageTimeLimitPayload', {
    notification
  })
}

// TODO: move to a separate file
const processLockOrganization = async (job: ScheduledJobOrganizationLock, {dataLoader}: {dataLoader: DataLoaderWorker}) => {
  const {orgId, runAt} = job

  const organization = await dataLoader.get('organizations').load(orgId)

  // Skip the job if unlocked or already locked or scheduled lock date changed
  if (!organization.scheduledLockAt || organization.lockedAt || organization.scheduledLockAt !== runAt) {
    return
  }

  const now = new Date()

  await r
    .table('Organization')
    .get(orgId)
    .update({
      lockedAt: now
    })
    .run()
}

const jobProcessors = {
  MEETING_STAGE_TIME_LIMIT_END: processMeetingStageTimeLimits,
  LOCK_ORGANIZATION: processLockOrganization
}

export type ScheduledJobUnion = Parameters<ValueOf<typeof jobProcessors>>[0]

const processJob = async (job: ScheduledJobUnion, {dataLoader}: {dataLoader: DataLoaderWorker}) => {
  const r = await getRethink()
  const res = await r.table('ScheduledJob').get(job.id).delete().run()
  // prevent duplicates. after this point, we assume the job finishes to completion (ignores server crashes, etc.)
  if (res.deleted !== 1) return
  const processor = jobProcessors[job.type]
  processor(job, {dataLoader}).catch(console.log)
}

const runScheduledJobs: MutationResolvers['runScheduledJobs'] = async (
  _source,
  {seconds},
  {dataLoader}
) => {
  const r = await getRethink()
  const now = new Date()

  // RESOLUTION
  const before = new Date(now.getTime() + seconds * 1000)
  const upcomingJobs = (await r
    .table('ScheduledJob')
    .between(r.minval, before, {index: 'runAt'})
    .run()) as ScheduledJobUnion[]

  upcomingJobs.forEach((job) => {
    const {runAt} = job
    const timeout = Math.max(0, runAt.getTime() - now.getTime())
    setTimeout(() => {
      processJob(job, {dataLoader}).catch(console.log)
    }, timeout)
  })

  return upcomingJobs.length
}

export default runScheduledJobs
