import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
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

  if (!reflectionGroupId && !reflectionId) {
    throw new GraphQLError('Must provide reflectionGroupId or reflectionId', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  // Resolve the meeting for auth checks
  let meetingId: string
  if (reflectionGroupId) {
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
    if (!reflectionGroup) {
      throw new GraphQLError('Reflection group not found', {extensions: {code: 'NOT_FOUND'}})
    }
    meetingId = reflectionGroup.meetingId
  } else {
    const reflection = await dataLoader.get('retroReflections').load(reflectionId!)
    if (!reflection) {
      throw new GraphQLError('Reflection not found', {extensions: {code: 'NOT_FOUND'}})
    }
    meetingId = reflection.meetingId
  }

  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    throw new GraphQLError('Not a team member', {extensions: {code: 'FORBIDDEN'}})
  }
  if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
    throw new GraphQLError('PAT does not grant access to this team', {
      extensions: {code: 'FORBIDDEN'}
    })
  }
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('group', phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  if (reflectionGroupId) {
    // Ungroup all: remove every reflection except the first from the group
    const reflections = await dataLoader.get('retroReflectionsByGroupId').load(reflectionGroupId)
    if (reflections.length <= 1) {
      throw new GraphQLError('Group has only one reflection', {extensions: {code: 'CONFLICT'}})
    }
    const reflectionsToUngroup = reflections.slice(1)
    for (const reflection of reflectionsToUngroup) {
      await removeReflectionFromGroup(reflection.id, context)
    }
  } else {
    // Remove single reflection from its group
    await removeReflectionFromGroup(reflectionId!, context)
  }

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UngroupReflectionSuccess', data, subOptions)
  return data
}

export default ungroupReflection
