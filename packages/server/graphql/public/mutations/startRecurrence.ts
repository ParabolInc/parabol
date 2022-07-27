import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRule} from 'rrule'
import getRethink from '../../../database/rethinkDriver'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../../../postgres/queries/insertMeetingSeries'
import {getUserId} from '../../../utils/authorization'
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

  if (meeting.meetingType !== 'teamPrompt') {
    return standardError(new Error('Meeting is not a team prompt meeting'), {userId: viewerId})
  }

  const {teamId, meetingSeriesId} = meeting
  if (meetingSeriesId) {
    return standardError(new Error('Meeting already has meeting series'), {userId: viewerId})
  }

  // Next meeting start is tomorrow at 9a UTC
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
    duration: 24 * 60 // 24 hours
  })

  await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        meetingSeriesId: newMeetingSeriesId,
        scheduledEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .default(null)
    .run()

  dataLoader.get('newMeetings').clear(meetingId)

  // RESOLUTION

  const data = {meetingId, meetingSeriesId: MeetingSeriesId.join(newMeetingSeriesId)}
  publish(SubscriptionChannel.TEAM, teamId, 'StartRecurrenceSuccess', data, subOptions)
  return data
}

export default startRecurrence
