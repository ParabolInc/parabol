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

// Next meeting start is tomorrow at 9a UTC
// :TODO: (jmtaber129): Determine this from meeting series configuration.
const createNextMeetingStartDate = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 9))
}

export const startNewMeetingSeries = async (
  viewerId: string,
  teamId: string,
  meetingId: string,
  meetingName: string,
  recurrenceRule: RRule
) => {
  const now = new Date()
  const r = await getRethink()

  // TODO: now, as new meeting series could be created from a new meeting view, let's grab the first part ie. "Standup - Jan 1" will be "Standup"
  // TODO: this is a temporary solution, we should have a better way to handle this
  const [cleanMeetingName] = meetingName.includes('-') ? meetingName.split('-') : [meetingName]

  const newMeetingSeriesParams = {
    meetingType: 'teamPrompt',
    title: cleanMeetingName!.trim(),
    recurrenceRule: recurrenceRule.toString(),
    // TODO: once we have to UI ready, we should set and handle it properly, for now meeting will last till the new meeting starts
    duration: 0,
    teamId,
    facilitatorId: viewerId
  } as const
  const newMeetingSeriesId = await insertMeetingSeriesQuery(newMeetingSeriesParams)
  const nextMeetingStartDate = recurrenceRule.after(now)

  await r
    .table('NewMeeting')
    .get(meetingId)
    .update({
      meetingSeriesId: newMeetingSeriesId,
      scheduledEndTime: nextMeetingStartDate
    })
    .run()

  return {
    id: newMeetingSeriesId,
    ...newMeetingSeriesParams
  }
}

const restartExistingMeetingSeries = async (meetingSeries: MeetingSeries) => {
  const r = await getRethink()
  const {cancelledAt, recurrenceRule, id: meetingSeriesId} = meetingSeries
  if (!cancelledAt) {
    return
  }

  const now = new Date()
  // to keep things simple, restart the meeting series at the same time a new series would start
  const currentRRule = RRule.fromString(recurrenceRule)
  const nextMeetingStartDate = currentRRule.after(now)
  const newRecurrenceRule = currentRRule.clone()
  newRecurrenceRule.options.dtstart = nextMeetingStartDate
  await restartMeetingSeries(meetingSeriesId, {recurrenceRule: newRecurrenceRule.toString()})

  // lets close all active meetings at the time when
  // a new meeting will be created (tomorrow at 9 AM, same as date start of new recurrence rule)
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
        scheduledEndTime: nextMeetingStartDate
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
  const viewerId = getUserId(authToken)
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
    await restartExistingMeetingSeries(meetingSeries)
    dataLoader.get('meetingSeries').clear(meetingSeriesId)

    analytics.recurrenceStarted(viewerId, meetingSeries)
  } else {
    const nextMeetingStartDate = createNextMeetingStartDate()
    const recurrenceRule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
      dtstart: nextMeetingStartDate
    })
    const newMeetingSeries = await startNewMeetingSeries(
      viewerId,
      teamId,
      meetingId,
      meeting.name,
      recurrenceRule
    )
    analytics.recurrenceStarted(viewerId, newMeetingSeries)
  }

  dataLoader.get('newMeetings').clear(meetingId)

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'StartRecurrenceSuccess', data, subOptions)
  return data
}

export default startRecurrence
