import dndNoise from 'parabol-client/utils/dndNoise'
import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import getRethink from '../../../../database/rethinkDriver'
import Reflection from '../../../../database/types/Reflection'
import getKysely from '../../../../postgres/getKysely'
import {GQLContext} from './../../../graphql'
import updateSmartGroupTitle from './updateSmartGroupTitle'

const addReflectionToGroup = async (
  reflectionId: string,
  reflectionGroupId: string,
  {dataLoader}: GQLContext,
  smartTitle?: string
) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) throw new Error('Reflection not found')
  const {reflectionGroupId: oldReflectionGroupId, meetingId: reflectionMeetingId} = reflection
  const [reflectionGroup, oldReflectionGroup] = await Promise.all([
    dataLoader.get('retroReflectionGroups').loadNonNull(reflectionGroupId),
    dataLoader.get('retroReflectionGroups').loadNonNull(oldReflectionGroupId)
  ])
  dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
  dataLoader.get('retroReflectionGroups').clear(oldReflectionGroupId)

  if (!reflectionGroup || !reflectionGroup.isActive) {
    throw new Error('Reflection group not found')
  }
  const {meetingId} = reflectionGroup
  if (reflectionMeetingId !== meetingId) {
    throw new Error('Reflection group not found')
  }
  const maxSortOrder = await r
    .table('RetroReflection')
    .getAll(reflectionGroupId, {index: 'reflectionGroupId'})('sortOrder')
    .max()
    .default(0)
    .run()

  // RESOLUTION
  const sortOrder = maxSortOrder + 1 + dndNoise()
  await r
    .table('RetroReflection')
    .get(reflectionId)
    .update({
      sortOrder,
      reflectionGroupId,
      updatedAt: now
    })
    .run()

  // mutate the dataLoader cache
  reflection.sortOrder = sortOrder
  reflection.reflectionGroupId = reflectionGroupId
  reflection.updatedAt = now

  if (oldReflectionGroupId !== reflectionGroupId) {
    // ths is not just a reorder within the same group
    const {nextReflections, oldReflections} = await r({
      nextReflections: r
        .table('RetroReflection')
        .getAll(reflectionGroupId, {index: 'reflectionGroupId'})
        .filter({isActive: true})
        .coerceTo('array') as unknown as Reflection[],
      oldReflections: r
        .table('RetroReflection')
        .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
        .filter({isActive: true})
        .coerceTo('array') as unknown as Reflection[]
    }).run()

    const nextTitle = smartTitle ?? getGroupSmartTitle(nextReflections)
    const oldGroupHasSingleReflectionCustomTitle =
      oldReflectionGroup.title !== oldReflectionGroup.smartTitle && oldReflections.length === 0
    const newGroupHasSmartTitle = reflectionGroup.title === reflectionGroup.smartTitle
    if (oldGroupHasSingleReflectionCustomTitle && newGroupHasSmartTitle) {
      // Edge case of dragging a single card with a custom group name on a group with smart name
      await pg
        .updateTable('RetroReflectionGroup')
        .set({title: oldReflectionGroup.title, smartTitle: nextTitle})
        .where('id', '=', reflectionGroupId)
        .execute()
    } else {
      await updateSmartGroupTitle(reflectionGroupId, nextTitle)
    }

    if (oldReflections.length > 0) {
      const oldTitle = getGroupSmartTitle(oldReflections)
      await updateSmartGroupTitle(oldReflectionGroupId, oldTitle)
    } else {
      await pg
        .updateTable('RetroReflectionGroup')
        .set({isActive: false})
        .where('id', '=', oldReflectionGroupId)
        .execute()
    }
  }
  return reflectionGroupId
}

export default addReflectionToGroup
