import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const startDraggingReflection: MutationResolvers['startDraggingReflection'] = async (
  _source,
  {reflectionId, dragId, isSpotlight},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) {
    return standardError(new Error('Reflection not found'), {userId: viewerId})
  }
  const {meetingId} = reflection
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) {
    return standardError(new Error('Meeting already ended'), {userId: viewerId})
  }
  if (isPhaseComplete('group', phases)) {
    return standardError(new Error('Meeting already completed'), {userId: viewerId})
  }

  // RESOLUTION
  const data = {
    teamId,
    meetingId,
    reflectionId,
    remoteDrag: {
      id: dragId,
      sourceId: reflectionId,
      dragUserId: viewerId,
      isSpotlight
    }
  }
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'StartDraggingReflectionPayload',
    data,
    subOptions
  )
  return data
}

export default startDraggingReflection
