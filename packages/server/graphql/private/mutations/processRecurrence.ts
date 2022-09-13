import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRule} from 'rrule'
import getRethink from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {getActiveMeetingSeries} from '../../../postgres/queries/getActiveMeetingSeries'
import {MeetingSeries} from '../../../postgres/types/MeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt from '../../mutations/helpers/safeCreateTeamPrompt'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import {MutationResolvers} from '../resolverTypes'

const startRecurringTeamPrompt = async (
  meetingSeries: MeetingSeries,
  startTime: Date,
  dataLoader,
  r,
  subOptions
) => {
  const {teamId, facilitatorId} = meetingSeries

  // AUTH
  const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
  if (unpaidError) return standardError(new Error(unpaidError), {userId: facilitatorId})

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  const meeting = await safeCreateTeamPrompt(teamId, facilitatorId, r, dataLoader, {
    name: `${meetingSeries.title} - ${formattedDate}`,
    scheduledEndTime: new Date(startTime.getTime() + ms(`${meetingSeries.duration}m`)),
    meetingSeriesId: meetingSeries.id
  })

  meeting.name = `${meetingSeries.title} - ${formattedDate}`
  meeting.scheduledEndTime = new Date(startTime.getTime() + ms(`${meetingSeries.duration}m`))
  meeting.meetingSeriesId = meetingSeries.id

  await r.table('NewMeeting').insert(meeting).run()

  IntegrationNotifier.startMeeting(dataLoader, meeting.id, teamId)
  analytics.meetingStarted(facilitatorId, meeting)
  const data = {teamId, meetingId: meeting.id}
  publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
}

const processRecurrence: MutationResolvers['processRecurrence'] = async (
  _source,
  {},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION

  // RESOLUTION
  // Find any meetings with a scheduledEndTime before now, and close them
  const teamPromptMeetingsToEnd = (await r
    .table('NewMeeting')
    .between([false, r.minval], [false, now], {index: 'hasEndedScheduledEndTime'})
    .filter({meetingType: 'teamPrompt'})
    .run()) as MeetingTeamPrompt[]

  const res = await Promise.all(
    teamPromptMeetingsToEnd.map(async (meeting) => {
      return await safeEndTeamPrompt({meeting, now, dataLoader, r, subOptions})
    })
  )

  const meetingsEnded = res.filter((res) => !('error' in res)).length

  let meetingsStarted = 0

  // For each active meeting series, get the meeting start times (according to rrule) after the most
  // recent meeting start time and before now.
  const activeMeetingSeries = await getActiveMeetingSeries()
  await Promise.all(
    activeMeetingSeries.map(async (meetingSeries) => {
      const lastMeeting = await r
        .table('NewMeeting')
        .getAll(meetingSeries.id, {index: 'meetingSeriesId'})
        .filter({meetingType: 'teamPrompt'})
        .orderBy(r.desc('createdAt'))
        .nth(0)
        .default(null)
        .run()

      // For meetings that should still be active, start the meeting and set its end time.
      // Any subscriptions are handled by the shared meeting start code
      const rrule = RRule.fromString(meetingSeries.recurrenceRule)

      // Only get meetings that should currently be active, i.e. meetings that should have started
      // within the last 24 hours, started after the last meeting in the series, and started before
      // 'now'.
      const fromDate = lastMeeting
        ? new Date(Math.max(lastMeeting.createdAt.getTime() + ms('10m'), now.getTime() - ms('24h')))
        : new Date(0)
      const newMeetingsStartTimes = rrule.between(fromDate, now)
      for (const startTime of newMeetingsStartTimes) {
        const err = await startRecurringTeamPrompt(
          meetingSeries,
          startTime,
          dataLoader,
          r,
          subOptions
        )
        if (!err) meetingsStarted++
      }
    })
  )

  const data = {meetingsStarted, meetingsEnded}
  return data
}

export default processRecurrence
