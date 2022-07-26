import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
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

  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  const {teamId, meetingSeriesId} = meeting
  if (meetingSeriesId) {
    return standardError(new Error('Meeting already has meeting series'), {userId: viewerId})
  }

  const newMeetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'teamPrompt',
    title: 'Async Standup',
    recurrenceRule: 'TODO',
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

  // VALIDATION

  // RESOLUTION

  const data = {meetingId, meetingSeriesId: MeetingSeriesId.join(newMeetingSeriesId)}
  publish(SubscriptionChannel.TEAM, teamId, 'StartRecurrenceSuccess', data, subOptions)
  return data
}

export default startRecurrence
