import {GraphQLInt, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {requireSU} from 'server/utils/authorization'
import ScheduledJob from 'server/database/types/ScheduledJob'
import ScheduledJobMeetingStageTimeLimit from 'server/database/types/ScheduledJobMetingStageTimeLimit'
import SlackManager from 'server/utils/SlackManager'
import makeAppLink from 'server/utils/makeAppLink'
import Meeting from 'server/database/types/Meeting'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import NotificationMeetingStageTimeLimit from 'server/database/types/NotificationMeetingStageTimeLimit'
import publish from 'server/utils/publish'
import MeetingStageTimeLimitPayload from 'server/graphql/types/MeetingStageTimeLimitPayload'

const processMeetingStageTimeLimits = async (job: ScheduledJobMeetingStageTimeLimit) => {
  const r = getRethink()
  const {meetingId} = job
  const meeting = (await r.table('NewMeeting').get(meetingId)) as Meeting
  const {teamId, facilitatorUserId, meetingType} = meeting
  const {slackNotification, slackAuth} = await r({
    slackNotification: r
      .table('SlackNotification')
      .getAll(facilitatorUserId, {index: 'userId'})
      .filter({teamId, event: 'MEETING_STAGE_TIME_LIMIT'})
      .nth(0)
      .default(null),
    slackAuth: r
      .table('SlackAuth')
      .getAll(facilitatorUserId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
  })

  let sendViaSlack =
    slackAuth && slackAuth.botAccessToken && slackNotification && slackNotification.channelId
  if (sendViaSlack) {
    const {channelId} = slackNotification
    const {botAccessToken} = slackAuth
    const manager = new SlackManager(botAccessToken)
    const slug = meetingTypeToSlug[meetingType]
    const meetingUrl = makeAppLink(`${slug}/${teamId}`)
    const slackText = `Time’s up! Progress your meeting to the next stage: ${meetingUrl}`
    const res = await manager.postMessage(channelId, slackText)
    if (!res.ok) {
      sendViaSlack = false
    }
  }
  if (!sendViaSlack) {
    const notification = new NotificationMeetingStageTimeLimit({
      meetingId,
      userIds: [facilitatorUserId]
    })
    await r.table('Notification').insert(notification)
    publish('notification', facilitatorUserId, MeetingStageTimeLimitPayload, {notification})
  }

  // get the meeting
  // get the facilitator
  // see if the facilitator has turned on slack notifications for the meeting
  // if so, send the facilitator a slack notification
  // if not, send the facilitator an in-app notification
}

const jobProcessors = {
  MEETING_STAGE_TIME_LIMIT: processMeetingStageTimeLimits
}

const processJob = async (job: ScheduledJob) => {
  const r = getRethink()
  const res = await r
    .table('ScheduledJob')
    .get(job.id)
    .delete()
  // prevent duplicates. after this point, we assume the job finishes to completion (ignores server crashes, etc.)
  if (res.deleted !== 1) return
  const processor = jobProcessors[job.type]
  processor(job as any).catch(console.log)
}

const runScheduledJobs = {
  type: GraphQLInt,
  description: 'schedule upcoming jobs to be run',
  args: {
    seconds: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Queue up all jobs that are scheduled to run within this many seconds'
    }
    // type: {
    //   type: GraphQLString,
    //   description: 'filter jobs by their type'
    // }
  },
  resolve: async (_source, {seconds}, {authToken}) => {
    const r = getRethink()
    const now = new Date()
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const before = new Date(now.getTime() + seconds * 1000)
    const upcomingJobs = await r.table('ScheduledJob').between(r.minval, before, {index: 'runAt'})

    upcomingJobs.forEach((job) => {
      const {runAt} = job
      const timeout = Math.max(0, runAt.getTime() - now.getTime())
      setTimeout(() => {
        processJob(job).catch(console.log)
      }, timeout)
    })

    return upcomingJobs.length
  }
}

export default runScheduledJobs
