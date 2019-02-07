import {getUserId, isTeamMember} from 'server/utils/authorization'
import getRethink from 'server/database/rethinkDriver'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import {GROUP} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

const moveReflectionGroup = async (reflectionGroupId, sortOrder, {authToken, dataLoader}) => {
  const r = getRethink()
  const now = new Date()
  const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId)
  const viewerId = getUserId(authToken)
  if (!reflectionGroup) {
    return standardError(new Error('Reflection group not found'), {userId: viewerId})
  }
  const {meetingId} = reflectionGroup
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
  if (isPhaseComplete(GROUP, phases)) {
    return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
  }

  // RESOLUTION
  await r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update({
      sortOrder,
      updatedAt: now
    })
  return {meetingId, reflectionGroupId, teamId}
}

export default moveReflectionGroup
