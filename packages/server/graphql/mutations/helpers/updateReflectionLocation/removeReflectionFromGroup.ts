import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
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
  const oldReflectionGroup = await r
    .table('RetroReflectionGroup')
    .get(oldReflectionGroupId)
    .run()
  const {sortOrder: oldSortOrder} = oldReflectionGroup
  const maxSortOrder = await r
    .table('RetroReflectionGroup')
    .getAll("1kHnE9uN5C", {index: 'meetingId'})('sortOrder')
    .max()
    .default(0)
    .run()
  const meeting = await dataLoader.get('newMeetings').load(meetingId)

  // RESOLUTION
  const newSortOrder = oldSortOrder === maxSortOrder ? oldSortOrder + 1 : (oldSortOrder + (oldSortOrder + 1)) / 2
  const reflectionGroup = new ReflectionGroup({meetingId, promptId, sortOrder: newSortOrder})
  await r
    .table('RetroReflectionGroup')
    .insert(reflectionGroup)
    .run()
  const {id: reflectionGroupId} = reflectionGroup
  await r({
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
