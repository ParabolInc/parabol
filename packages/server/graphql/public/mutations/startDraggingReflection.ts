import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId} from '../../../utils/authorization'
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
  const reflection = await dataLoader.get('retroReflections').loadNonNull(reflectionId)
  const {meetingId} = reflection
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {endedAt, phases, teamId} = meeting

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
