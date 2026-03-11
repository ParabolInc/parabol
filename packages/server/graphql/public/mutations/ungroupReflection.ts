import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import removeReflectionFromGroup from '../../mutations/helpers/updateReflectionLocation/removeReflectionFromGroup'
import type {MutationResolvers} from '../resolverTypes'

const ungroupReflection: MutationResolvers['ungroupReflection'] = async (
  _source,
  {reflectionGroupId, reflectionId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  if (!reflectionGroupId && !reflectionId) {
    return standardError(new Error('Must provide reflectionGroupId or reflectionId'), {
      userId: viewerId
    })
  }

  // Resolve the meeting for auth checks
  let meetingId: string
  let teamId: string
  if (reflectionGroupId) {
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
    if (!reflectionGroup) {
      return standardError(new Error('Reflection group not found'), {userId: viewerId})
    }
    meetingId = reflectionGroup.meetingId
  } else {
    const reflection = await dataLoader.get('retroReflections').load(reflectionId!)
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    meetingId = reflection.meetingId
  }

  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases} = meeting
  teamId = meeting.teamId
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
  if (isPhaseComplete('group', phases)) {
    return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
  }

  // RESOLUTION
  if (reflectionGroupId) {
    // Ungroup all: remove every reflection except the first from the group
    const reflections = await dataLoader.get('retroReflectionsByGroupId').load(reflectionGroupId)
    if (reflections.length <= 1) {
      return standardError(new Error('Group has only one reflection'), {userId: viewerId})
    }
    const reflectionsToUngroup = reflections.slice(1)
    for (const reflection of reflectionsToUngroup) {
      try {
        await removeReflectionFromGroup(reflection.id, context)
      } catch (e) {
        const error =
          e instanceof Error
            ? e
            : new Error(`Failed to removeReflectionFromGroup. reflectionId: ${reflection.id}`)
        return standardError(error, {userId: viewerId})
      }
    }
  } else {
    // Remove single reflection from its group
    try {
      await removeReflectionFromGroup(reflectionId!, context)
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error(`Failed to removeReflectionFromGroup. reflectionId: ${reflectionId}`)
      return standardError(error, {userId: viewerId})
    }
  }

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UngroupReflectionSuccess', data, subOptions)
  return data
}

export default ungroupReflection
