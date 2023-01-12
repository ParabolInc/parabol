import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import NotificationMeetingStageTimeLimitEnd from '../../../database/types/NotificationMeetingStageTimeLimitEnd'
import processTeamsLimitsJob from '../../../database/types/processTeamsLimitsJob'
import ScheduledJobMeetingStageTimeLimit from '../../../database/types/ScheduledJobMetingStageTimeLimit'
import ScheduledTeamLimitsJob from '../../../database/types/ScheduledTeamLimitsJob'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'

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

export type ScheduledJobUnion = ScheduledJobMeetingStageTimeLimit | ScheduledTeamLimitsJob

const processJob = async (job: ScheduledJobUnion, {dataLoader}: {dataLoader: DataLoaderWorker}) => {
  const r = await getRethink()
  const res = await r.table('ScheduledJob').get(job.id).delete().run()
  // prevent duplicates. after this point, we assume the job finishes to completion (ignores server crashes, etc.)
  if (res.deleted !== 1) return
  if ('orgId' in job) {
    return processTeamsLimitsJob(job, dataLoader).catch(console.log)
  } else {
    return processMeetingStageTimeLimits(job, {
      dataLoader
    }).catch(console.log)
  }
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
