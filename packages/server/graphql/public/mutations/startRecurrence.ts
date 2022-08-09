import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRule} from 'rrule'
import getRethink from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../../../postgres/queries/insertMeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import updateMeetingSeries from '../../../postgres/queries/updateMeetingSeries'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

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
    if (!meetingSeries.cancelledAt) {
      return standardError(new Error('Meeting is already recurring'), {userId: viewerId})
    }

    // meeting has stopped recurrence associated with it, reenable it
    await updateMeetingSeries({cancelledAt: null}, meeting.meetingSeriesId)
    dataLoader.get('meetingSeries').clear(meeting.meetingSeriesId)

    // TODO: what's the right time to close all the open meetings in the series?
    // for now, let's set all the meetings to close in 24h
    await r
      .table('NewMeeting')
      .filter({meetingSeriesId: meetingSeries.id})
      .filter({endedAt: null}, {default: true})
      .update({
        scheduledEndTime: new Date(Date.now() + ms('24h'))
      })
      .run()

    return {meetingId}
  }

  // Next meeting start is tomorrow at 9a UTC
  // :TODO: (jmtaber129): Determine this from meeting series configuration.
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 9)
  )
  const recurrenceRule = new RRule({
    freq: RRule.WEEKLY,
    byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
    dtstart: startDate
  })

  const newMeetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'teamPrompt',
    title: 'Async Standup',
    recurrenceRule: recurrenceRule.toString(),
    duration: 24 * 60, // 24 hours
    teamId,
    facilitatorId: viewerId
  })

  const updatedMeeting = (await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        meetingSeriesId: newMeetingSeriesId,
        scheduledEndTime: new Date(Date.now() + ms('24h')) // 24 hours from now
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .run()) as MeetingTeamPrompt

  dataLoader.get('newMeetings').clear(meetingId)

  // RESOLUTION

  analytics.recurrenceStarted(viewerId, updatedMeeting)
  const data = {meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'StartRecurrenceSuccess', data, subOptions)
  return data
}

export default startRecurrence
