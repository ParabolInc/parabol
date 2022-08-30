import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRule} from 'rrule'
import getRethink from '../../../database/rethinkDriver'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../../../postgres/queries/insertMeetingSeries'
import restartMeetingSeries from '../../../postgres/queries/restartMeetingSeries'
import {MeetingSeries} from '../../../postgres/types/MeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const MEETING_DURATION_IN_MINUTES = 24 * 60 // 24 hours

const restartRecurrence = async (meetingSeries: MeetingSeries) => {
  const r = await getRethink()
  const {cancelledAt, recurrenceRule, id: meetingSeriesId} = meetingSeries
  if (!cancelledAt) {
    return
  }

  const now = new Date()
  const currentRRule = RRule.fromString(recurrenceRule)
  const hasRecentlyStopped = cancelledAt.getTime() > now.getTime() - ms('1h')
  const nextScheduledStartDate = currentRRule.after(now)
  const isNextScheduledStartDateReasonable =
    nextScheduledStartDate.getTime() > now.getTime() + ms('9h')
  if (hasRecentlyStopped || isNextScheduledStartDateReasonable) {
    // no need to change the recurrence rule, next meeting starts in reasonable time
    await restartMeetingSeries(meetingSeriesId)
  } else {
    // meeting series was stopped more than ~1h ago and the next scheduled start date is within the next ~9h
    // to prevent a meeting from being scheduled too soon, we need to change the recurrence rule
    const newRecurrenceRule = currentRRule.clone()
    newRecurrenceRule.options.dtstart = new Date(nextScheduledStartDate.getTime() + ms('1d'))

    await restartMeetingSeries(meetingSeriesId, {recurrenceRule: newRecurrenceRule.toString()})
  }

  // update all the active meetings to end at proper time
  const activeMeetings = await r
    .table('NewMeeting')
    .getAll(meetingSeriesId, {index: 'meetingSeriesId'})
    .filter({endedAt: null}, {default: true})
    .run()
  const updates = activeMeetings.map((meeting) =>
    r
      .table('NewMeeting')
      .get(meeting.id)
      .update({
        scheduledEndTime: new Date(meeting.createdAt.getTime() + ms(`${meetingSeries.duration}m`))
      })
      .run()
  )
  await Promise.all(updates)
}

const startRecurrence: MutationResolvers['startRecurrence'] = async (
  _source,
  {meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  const {teamId, meetingType} = meeting

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (meetingType !== 'teamPrompt') {
    return standardError(new Error('Meeting is not a team prompt meeting'), {userId: viewerId})
  }

  if (meeting.meetingSeriesId) {
    const meetingSeries = await dataLoader.get('meetingSeries').loadNonNull(meeting.meetingSeriesId)
    const {cancelledAt, id: meetingSeriesId} = meetingSeries
    if (!cancelledAt) {
      return standardError(new Error('Meeting is already recurring'), {userId: viewerId})
    }
    await restartRecurrence(meetingSeries)
    dataLoader.get('meetingSeries').clear(meetingSeriesId)

    analytics.recurrenceStarted(viewerId, meetingSeries)
  } else {
    // Next meeting start is tomorrow at 9a UTC
    // :TODO: (jmtaber129): Determine this from meeting series configuration.
    const nextMeetingStartDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 9)
    )
    const recurrenceRule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
      dtstart: nextMeetingStartDate
    })

    const newMeetingSeriesParams = {
      meetingType: 'teamPrompt',
      title: 'Async Standup',
      recurrenceRule: recurrenceRule.toString(),
      duration: MEETING_DURATION_IN_MINUTES,
      teamId,
      facilitatorId: viewerId
    } as const
    const newMeetingSeriesId = await insertMeetingSeriesQuery(newMeetingSeriesParams)

    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        meetingSeriesId: newMeetingSeriesId,
        scheduledEndTime: new Date(now.getTime() + ms('24h')) // 24 hours from now
      })
      .run()
    dataLoader.get('newMeetings').clear(meetingId)

    analytics.recurrenceStarted(viewerId, {id: newMeetingSeriesId, ...newMeetingSeriesParams})
  }

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'StartRecurrenceSuccess', data, subOptions)
  return data
}

export default startRecurrence
