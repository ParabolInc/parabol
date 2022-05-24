import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const updateMeetingPrompt: MutationResolvers['updateMeetingPrompt'] = async (
  _source,
  {meetingId, newPrompt},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return {error: {message: 'Meeting not found'}}
  }
  if (meeting.meetingType !== 'teamPrompt') {
    return {error: {message: 'Meeting is not a team prompt meeting'}}
  }
  const {facilitatorUserId} = meeting
  if (viewerId !== facilitatorUserId) {
    return {error: {message: 'Only the facilitator can change the meeting prompt'}}
  }

  // VALIDATION
  if (newPrompt.length < 2) {
    return {error: {message: 'Invalid meeting prompt'}}
  }

  // RESOLUTION
  await r
    .table('NewMeeting')
    .get(meetingId)
    .update({
      meetingPrompt: newPrompt
    })
    .run()
  dataLoader.get('newMeetings').clear(meetingId)

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingPromptSuccess', data, subOptions)
  return data
}

export default updateMeetingPrompt
