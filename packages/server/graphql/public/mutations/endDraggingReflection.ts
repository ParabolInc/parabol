import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import removeReflectionFromGroup from '../../mutations/helpers/updateReflectionLocation/removeReflectionFromGroup'
import type {MutationResolvers} from '../resolverTypes'

const endDraggingReflection: MutationResolvers['endDraggingReflection'] = async (
  _source,
  {reflectionId, dropTargetType, dropTargetId, dragId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) {
    throw new GraphQLError('Reflection not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {meetingId, reflectionGroupId: oldReflectionGroupId} = reflection
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('group', phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  let newReflectionGroupId: string | undefined
  if (dropTargetType === 'REFLECTION_GRID') {
    newReflectionGroupId = await removeReflectionFromGroup(reflectionId, context)
  } else if (dropTargetType === 'REFLECTION_GROUP' && dropTargetId) {
    newReflectionGroupId = await addReflectionToGroup(reflectionId, dropTargetId, context)
  }
  const data = {
    meetingId,
    reflectionId,
    reflectionGroupId: newReflectionGroupId,
    oldReflectionGroupId,
    userId: viewerId,
    dropTargetType,
    dropTargetId,
    // Null when the move was not a drag at all, e.g. the Group button on a hovered card. The field
    // is nullable, but RemoteReflectionDrag.id is not, so a stub drag here fails the whole payload
    remoteDrag: dragId ? {id: dragId, dragUserId: viewerId} : null
  }
  publish(SubscriptionChannel.MEETING, meetingId, 'EndDraggingReflectionPayload', data, subOptions)
  return data
}

export default endDraggingReflection
