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

  const {teamId, meetingType, meetingSeriesId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (meetingType !== 'teamPrompt') {
    return standardError(new Error('Meeting is not a team prompt meeting'), {userId: viewerId})
  }

  if (!meetingSeriesId) {
    return standardError(new Error('Meeting does not have meeting series associated!'), {
      userId: viewerId
    })
  }

  await updateMeetingSeries({cancelledAt: now}, meetingSeriesId)
  dataLoader.get('meetingSeries').clear(meetingSeriesId)

  await r
    .table('NewMeeting')
    .getAll(meetingSeriesId, {index: 'meetingSeriesId'})
    .filter({endedAt: null}, {default: true})
    .update({
      scheduledEndTime: null
    })
    .run()

  // RESOLUTION
  const data = {meetingId}
  return data
}

export default stopRecurrence
