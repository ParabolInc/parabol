import getRethink from '../../../database/rethinkDriver'
import updateMeetingSeries from '../../../postgres/queries/updateMeetingSeries'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const stopRecurrence: MutationResolvers['stopRecurrence'] = async (
  _source,
  {meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const now = new Date()

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

  if (!meeting.meetingSeriesId) {
    return standardError(new Error('Meeting does not have meeting series associated!'), {
      userId: viewerId
    })
  }

  const meetingSeries = await dataLoader.get('meetingSeries').loadNonNull(meeting.meetingSeriesId)
  await updateMeetingSeries({cancelledAt: now}, meetingSeries.id)

  dataLoader.get('meetingSeries').clear(meeting.meetingSeriesId)

  await r
    .table('NewMeeting')
    .filter({meetingSeriesId: meetingSeries.id, endedAt: null})
    .update({
      scheduledEndTime: undefined
    })
    .run()

  // RESOLUTION
  const data = {meetingId}
  return data
}

export default stopRecurrence
