import getGroupSmartTitle from 'parabol-client/utils/autogroup/getGroupSmartTitle'
import getRethink from '../../../../database/rethinkDriver'
import updateSmartGroupTitle from './updateSmartGroupTitle'
import dndNoise from '../../../../../client/utils/dndNoise'
import standardError from '../../../../utils/standardError'
import {getUserId} from '../../../../utils/authorization'
import Reflection from '../../../../database/types/Reflection'

const addReflectionToGroup = async (reflectionId, reflectionGroupId, {authToken, dataLoader}) => {
  const r = await getRethink()
  const now = new Date()
  const viewerId = getUserId(authToken)
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) return standardError(new Error('Reflection not found'), {userId: viewerId})
  const {reflectionGroupId: oldReflectionGroupId, meetingId: reflectionMeetingId} = reflection
  const reflectionGroup = await r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .run()
  if (!reflectionGroup || !reflectionGroup.isActive) {
    return standardError(new Error('Reflection group not found'), {userId: viewerId})
  }
  const {meetingId} = reflectionGroup
  if (reflectionMeetingId !== meetingId) {
    return standardError(new Error('Reflection group not found'), {userId: viewerId})
  }
  const maxSortOrder = await r
    .table('RetroReflection')
    .getAll(reflectionGroupId, {index: 'reflectionGroupId'})('sortOrder')
    .max()
    .run()

  // RESOLUTION
  await r
    .table('RetroReflection')
    .get(reflectionId)
    .update({
      sortOrder: maxSortOrder + 1 + dndNoise(),
      reflectionGroupId,
      updatedAt: now
    })
    .run()

  // mutate the dataLoader cache
  reflection.reflectionGroupId = reflectionGroupId
  reflection.updatedAt = now

  if (oldReflectionGroupId !== reflectionGroupId) {
    // ths is not just a reorder within the same group
    const {nextReflections, oldReflections} = await r({
      nextReflections: (r
        .table('RetroReflection')
        .getAll(reflectionGroupId, {index: 'reflectionGroupId'})
        .filter({isActive: true})
        .coerceTo('array') as unknown) as Reflection[],
      oldReflections: (r
        .table('RetroReflection')
        .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
        .filter({isActive: true})
        .coerceTo('array') as unknown) as Reflection[]
    }).run()

    const nextTitle = getGroupSmartTitle(nextReflections)
    await updateSmartGroupTitle(reflectionGroupId, nextTitle)

    if (oldReflections.length > 0) {
      const oldTitle = getGroupSmartTitle(oldReflections)
      await updateSmartGroupTitle(oldReflectionGroupId, oldTitle)
    } else {
      await r
        .table('RetroReflectionGroup')
        .get(oldReflectionGroupId)
        .update({
          isActive: false,
          updatedAt: now
        })
        .run()
    }
  }
  return reflectionGroupId
}

export default addReflectionToGroup
