import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import dndNoise from '../../../../../client/utils/dndNoise'
import getRethink from '../../../../database/rethinkDriver'
import ReflectionGroup from '../../../../database/types/ReflectionGroup'
import updateSmartGroupTitle from './updateSmartGroupTitle'

const removeReflectionFromGroup = async (reflectionId, {dataLoader}) => {
  const r = await getRethink()
  const now = new Date()
  const reflection = await r
    .table('RetroReflection')
    .get(reflectionId)
    .run()
  if (!reflection) throw new Error('Reflection not found')
  const {reflectionGroupId: oldReflectionGroupId, meetingId, promptId} = reflection
  const [oldReflectionGroup, reflectionGroups, meeting] = await Promise.all([
    dataLoader.get('reflectionGroup').load(oldReflectionGroupId),
    r
      .table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true})
      .orderBy('sortOrder')
      .run(),
    dataLoader.get('newMeetings').load(meetingId)
  ])

  const {sortOrder: oldSortOrder} = oldReflectionGroup

  // RESOLUTION
  const nextReflectionGroupIndex =
    reflectionGroups.findIndex(({id}) => id === oldReflectionGroup.id) + 1
  let newSortOrder
  if (nextReflectionGroupIndex >= reflectionGroups.length) {
    newSortOrder = oldSortOrder + 1 + dndNoise()
  } else {
    const nextSortOrder = reflectionGroups[nextReflectionGroupIndex].sortOrder
    newSortOrder = (oldSortOrder + nextSortOrder) / 2 + dndNoise()
  }
  const reflectionGroup = new ReflectionGroup({meetingId, promptId, sortOrder: newSortOrder})
  const {id: reflectionGroupId} = reflectionGroup
  await r({
    reflectionGroup: r.table('RetroReflectionGroup').insert(reflectionGroup),
    reflection: r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        sortOrder: 0,
        reflectionGroupId,
        updatedAt: now
      }),
    meeting: r
      .table('NewMeeting')
      .get(meetingId)
      .update({nextAutoGroupThreshold: null})
  }).run()
  // mutates the dataloader response
  meeting.nextAutoGroupThreshold = null
  const oldReflections = await r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .run()

  const nextTitle = getGroupSmartTitle([reflection])
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
  return reflectionGroupId
}

export default removeReflectionFromGroup
