import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
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
    return standardError(new Error('Reflection not found'), {userId: viewerId})
  }
  const {meetingId, reflectionGroupId: oldReflectionGroupId} = reflection
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
  if (isPhaseComplete('group', phases)) {
    return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
  }

  // RESOLUTION
  let newReflectionGroupId: string | undefined
  if (dropTargetType === 'REFLECTION_GRID') {
    try {
      newReflectionGroupId = await removeReflectionFromGroup(reflectionId, context)
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error(`Failed to removeReflectionFromGroup. reflectionId: ${reflectionId}`)
      return standardError(error, {userId: viewerId})
    }
  } else if (dropTargetType === 'REFLECTION_GROUP' && dropTargetId) {
    try {
      newReflectionGroupId = await addReflectionToGroup(reflectionId, dropTargetId, context)
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error(`Failed to addReflectionToGroup. reflectionId: ${reflectionId}`)
      return standardError(error, {userId: viewerId})
    }
  }
  const data = {
    meetingId,
    reflectionId,
    reflectionGroupId: newReflectionGroupId,
    oldReflectionGroupId,
    userId: viewerId,
    dropTargetType,
    dropTargetId,
    remoteDrag: {
      id: dragId,
      dragUserId: viewerId
    }
  }
  publish(SubscriptionChannel.MEETING, meetingId, 'EndDraggingReflectionPayload', data, subOptions)
  return data
}

export default endDraggingReflection
