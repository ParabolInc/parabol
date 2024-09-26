import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateMeetingPrompt: MutationResolvers['updateMeetingPrompt'] = async (
  _source,
  {meetingId, newPrompt},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  if (meeting.meetingType !== 'teamPrompt') {
    return standardError(new Error('Meeting is not a team prompt meeting'), {userId: viewerId})
  }
  const {facilitatorUserId} = meeting
  if (viewerId !== facilitatorUserId) {
    return standardError(new Error('Only the facilitator can change the meeting prompt'), {
      userId: viewerId
    })
  }

  // VALIDATION
  if (newPrompt.length < 2 || newPrompt.length > 500) {
    return standardError(new Error('Invalid meeting prompt'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('NewMeeting')
    .set({meetingPrompt: newPrompt})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.get('newMeetings').clear(meetingId)

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingPromptSuccess', data, subOptions)
  return data
}

export default updateMeetingPrompt
