import makeRetroGroupTitle from 'server/graphql/mutations/helpers/makeRetroGroupTitle'
import getRethink from 'server/database/rethinkDriver'
import {
  sendReflectionGroupNotFoundError,
  sendReflectionNotFoundError
} from 'server/utils/docNotFoundErrors'
import updateGroupTitle from 'server/graphql/mutations/helpers/updateReflectionLocation/updateGroupTitle'
import dndNoise from 'universal/utils/dndNoise'

const addReflectionToGroup = async (reflectionId, reflectionGroupId, {authToken, dataLoader}) => {
  const r = getRethink()
  const now = new Date()
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId)
  const {reflectionGroupId: oldReflectionGroupId, meetingId: reflectionMeetingId} = reflection
  const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId)
  if (!reflectionGroup || !reflectionGroup.isActive) {
    return sendReflectionGroupNotFoundError(authToken, reflectionGroupId)
  }
  const {meetingId} = reflectionGroup
  if (reflectionMeetingId !== meetingId) {
    sendReflectionGroupNotFoundError(authToken, reflectionGroupId)
  }
  const maxSortOrder = await r
    .table('RetroReflection')
    .getAll(reflectionGroupId, {index: 'reflectionGroupId'})('sortOrder')
    .max()

  // RESOLUTION
  await r
    .table('RetroReflection')
    .get(reflectionId)
    .update({
      sortOrder: maxSortOrder + 1 + dndNoise(),
      reflectionGroupId,
      updatedAt: now
    })

  // mutate the dataLoader cache
  reflection.reflectionGroupId = reflectionGroupId
  reflection.updatedAt = now

  if (oldReflectionGroupId !== reflectionGroupId) {
    // ths is not just a reorder within the same group
    const {nextReflections, oldReflections} = await r({
      nextReflections: r
        .table('RetroReflection')
        .getAll(reflectionGroupId, {index: 'reflectionGroupId'})
        .filter({isActive: true})
        .coerceTo('array'),
      oldReflections: r
        .table('RetroReflection')
        .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
        .filter({isActive: true})
        .coerceTo('array')
    })

    const {smartTitle: nextGroupSmartTitle, title: nextGroupTitle} = makeRetroGroupTitle(
      meetingId,
      nextReflections
    )
    await updateGroupTitle(reflectionGroupId, nextGroupSmartTitle, nextGroupTitle)

    if (oldReflections.length > 0) {
      const {smartTitle: oldGroupSmartTitle, title: oldGroupTitle} = makeRetroGroupTitle(
        meetingId,
        oldReflections
      )
      await updateGroupTitle(oldReflectionGroupId, oldGroupSmartTitle, oldGroupTitle)
    } else {
      await r
        .table('RetroReflectionGroup')
        .get(oldReflectionGroupId)
        .update({
          isActive: false,
          updatedAt: now
        })
    }
  }
  return reflectionGroupId
}

export default addReflectionToGroup
