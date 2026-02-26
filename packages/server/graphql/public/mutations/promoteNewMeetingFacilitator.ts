import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const promoteNewMeetingFacilitator: MutationResolvers['promoteNewMeetingFacilitator'] = async (
  _source,
  {facilitatorUserId, meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {facilitatorUserId: oldFacilitatorUserId, teamId, endedAt} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // VALIDATION
  const newFacilitator = await dataLoader.get('users').load(facilitatorUserId)
  if (!newFacilitator) {
    return standardError(new Error('New facilitator does not exist'), {userId: viewerId})
  }
  if (!newFacilitator.tms.includes(teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) {
    return {error: {message: 'Meeting has already ended'}}
  }

  // RESOLUTION
  await getKysely()
    .updateTable('NewMeeting')
    .set({facilitatorUserId})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const data = {meetingId, oldFacilitatorUserId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'PromoteNewMeetingFacilitatorPayload',
    data,
    subOptions
  )
  return data
}

export default promoteNewMeetingFacilitator
