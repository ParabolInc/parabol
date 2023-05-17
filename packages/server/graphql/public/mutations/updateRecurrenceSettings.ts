import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRule} from 'rrule'
import getRethink from '../../../database/rethinkDriver'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../../../postgres/queries/insertMeetingSeries'
import restartMeetingSeries from '../../../postgres/queries/restartMeetingSeries'
import updateMeetingSeriesQuery from '../../../postgres/queries/updateMeetingSeries'
import {MeetingSeries} from '../../../postgres/types/MeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

export const startNewMeetingSeries = async (
  viewerId: string,
  teamId: string,
  meetingId: string,
  meetingName: string,
  recurrenceRule: RRule,
  meetingSeriesName?: string | null
) => {
  const now = new Date()
  const r = await getRethink()

  const newMeetingSeriesParams = {
    meetingType: 'teamPrompt',
    title: meetingSeriesName || meetingName.split('-')[0].trim(), // if no name is provided, we use the name of the first meeting without the date
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

const updateMeetingSeries = async (meetingSeries: MeetingSeries, newRecurrenceRule: RRule) => {
  const r = await getRethink()
  const {id: meetingSeriesId} = meetingSeries

  const now = new Date()
  const nextMeetingStartDate = newRecurrenceRule.after(now)
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

const stopMeetingSeries = async (meetingSeries: MeetingSeries) => {
  const r = await getRethink()
  const now = new Date()

  await updateMeetingSeriesQuery({cancelledAt: now}, meetingSeries.id)
  await r
    .table('NewMeeting')
    .getAll(meetingSeries.id, {index: 'meetingSeriesId'})
    .filter({endedAt: null}, {default: true})
    .update({
      scheduledEndTime: null
    })
    .run()
}

const updateRecurrenceSettings: MutationResolvers['updateRecurrenceSettings'] = async (
  _source,
  {meetingId, recurrenceSettings},
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

    if (!recurrenceSettings.rrule) {
      await stopMeetingSeries(meetingSeries)
      analytics.recurrenceStopped(viewerId, meetingSeries)
    } else {
      await updateMeetingSeries(meetingSeries, recurrenceSettings.rrule)
      analytics.recurrenceStarted(viewerId, meetingSeries)
    }

    if (recurrenceSettings.name) {
      await updateMeetingSeriesQuery({title: recurrenceSettings.name}, meetingSeries.id)
    }

    dataLoader.get('meetingSeries').clear(meetingSeries.id)
  } else {
    if (!recurrenceSettings.rrule) {
      return standardError(
        new Error('When meeting is not recurring, recurrence rule has to be provided'),
        {userId: viewerId}
      )
    }

    const newMeetingSeries = await startNewMeetingSeries(
      viewerId,
      teamId,
      meetingId,
      meeting.name,
      recurrenceSettings.rrule,
      recurrenceSettings.name
    )
    analytics.recurrenceStarted(viewerId, newMeetingSeries)
  }

  dataLoader.get('newMeetings').clear(meetingId)

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateRecurrenceSettingsSuccess', data, subOptions)
  return data
}

export default updateRecurrenceSettings
