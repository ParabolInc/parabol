import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getRRuleDateFromJSDate, getJSDateFromRRuleDate} from 'parabol-client/shared/rruleUtil'
import {RRule, datetime} from 'rrule'
import getRethink, {ParabolR} from '../../../database/rethinkDriver'
import MeetingTeamPrompt, {createTeamPromptTitle} from '../../../database/types/MeetingTeamPrompt'
import {getActiveMeetingSeries} from '../../../postgres/queries/getActiveMeetingSeries'
import {MeetingSeries} from '../../../postgres/types/MeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import publish, {SubOptions} from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {DataLoaderWorker} from '../../graphql'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt, {DEFAULT_PROMPT} from '../../mutations/helpers/safeCreateTeamPrompt'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import {MutationResolvers} from '../resolverTypes'

const startRecurringTeamPrompt = async (
  meetingSeries: MeetingSeries,
  lastMeeting: MeetingTeamPrompt | null,
  startTime: Date,
  dataLoader: DataLoaderWorker,
  r: ParabolR,
  subOptions: SubOptions
) => {
  const {teamId, facilitatorId} = meetingSeries

  // AUTH
  const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
  if (unpaidError) return standardError(new Error(unpaidError), {userId: facilitatorId})

  const rrule = RRule.fromString(meetingSeries.recurrenceRule)
  const nextMeetingStartDate = rrule.after(getRRuleDateFromJSDate(startTime))
  const meetingName = createTeamPromptTitle(
    meetingSeries.title,
    startTime,
    rrule.options.tzid ?? 'UTC'
  )
  const meeting = await safeCreateTeamPrompt(meetingName, teamId, facilitatorId, r, dataLoader, {
    scheduledEndTime: nextMeetingStartDate ? getJSDateFromRRuleDate(nextMeetingStartDate) : null,
    meetingSeriesId: meetingSeries.id,
    meetingPrompt: lastMeeting ? lastMeeting.meetingPrompt : DEFAULT_PROMPT
  })

  await r.table('NewMeeting').insert(meeting).run()

  IntegrationNotifier.startMeeting(dataLoader, meeting.id, teamId)
  analytics.meetingStarted(facilitatorId, meeting)
  const data = {teamId, meetingId: meeting.id}
  publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
}

const processRecurrence: MutationResolvers['processRecurrence'] = async (_source, {}, context) => {
  const {dataLoader, socketId: mutatorId} = context
  const r = await getRethink()
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // RESOLUTION
  // Find any meetings with a scheduledEndTime before now, and close them
  const teamPromptMeetingsToEnd = (await r
    .table('NewMeeting')
    .between([false, r.minval], [false, now], {index: 'hasEndedScheduledEndTime'})
    .filter({meetingType: 'teamPrompt'})
    .run()) as MeetingTeamPrompt[]

  const res = await Promise.all(
    teamPromptMeetingsToEnd.map((meeting) =>
      safeEndTeamPrompt({meeting, now, context, r, subOptions})
    )
  )

  const meetingsEnded = res.filter((res) => !('error' in res)).length

  let meetingsStarted = 0

  // For each active meeting series, get the meeting start times (according to rrule) after the most
  // recent meeting start time and before now.
  const activeMeetingSeries = await getActiveMeetingSeries()
  await Promise.all(
    activeMeetingSeries.map(async (meetingSeries) => {
      const seriesTeam = await dataLoader.get('teams').loadNonNull(meetingSeries.teamId)
      if (seriesTeam.isArchived || !seriesTeam.isPaid) {
        return
      }

      const seriesOrg = await dataLoader.get('organizations').load(seriesTeam.orgId)
      if (seriesOrg.lockedAt) {
        return
      }

      const lastMeeting = (await r
        .table('NewMeeting')
        .getAll(meetingSeries.id, {index: 'meetingSeriesId'})
        .filter({meetingType: 'teamPrompt'})
        .orderBy(r.desc('createdAt'))
        .nth(0)
        .default(null)
        .run()) as MeetingTeamPrompt | null

      // For meetings that should still be active, start the meeting and set its end time.
      // Any subscriptions are handled by the shared meeting start code
      const rrule = RRule.fromString(meetingSeries.recurrenceRule)
      // technically, RRULE should never return NaN here but there's a bug in the library
      // https://github.com/jakubroztocil/rrule/issues/321
      if (isNaN(rrule.options.interval)) {
        return
      }

      // Only get meetings that should currently be active, i.e. meetings that should have started
      // within the last 24 hours, started after the last meeting in the series, and started before
      // 'now'.
      const fromDate = lastMeeting
        ? new Date(Math.max(lastMeeting.createdAt.getTime() + ms('10m'), now.getTime() - ms('24h')))
        : new Date(0)
      const newMeetingsStartTimes = rrule.between(
        getRRuleDateFromJSDate(fromDate),
        getRRuleDateFromJSDate(now)
      )
      for (const startTime of newMeetingsStartTimes) {
        const err = await startRecurringTeamPrompt(
          meetingSeries,
          lastMeeting,
          getJSDateFromRRuleDate(startTime),
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
