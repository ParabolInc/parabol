import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
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
    throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  }
  if (isPhaseComplete('group', phases)) {
    throw new GraphQLError('Meeting already completed', {extensions: {code: 'CONFLICT'}})
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
