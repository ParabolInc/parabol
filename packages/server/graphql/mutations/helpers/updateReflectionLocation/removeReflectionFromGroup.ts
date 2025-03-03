import dndNoise from '../../../../../client/utils/dndNoise'
import ReflectionGroup from '../../../../database/types/ReflectionGroup'
import getKysely from '../../../../postgres/getKysely'
import {GQLContext} from '../../../graphql'
import updateGroupTitle from '../updateGroupTitle'

const removeReflectionFromGroup = async (reflectionId: string, {dataLoader}: GQLContext) => {
  const pg = getKysely()
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) throw new Error('Reflection not found')
  const {reflectionGroupId: oldReflectionGroupId, meetingId, promptId} = reflection
  const [meetingReflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  dataLoader.get('retroReflectionGroupsByMeetingId').clear(meetingId)
  dataLoader.get('retroReflectionGroups').clearAll()
  const oldReflectionGroup = meetingReflectionGroups.find((g) => g.id === oldReflectionGroupId)
  const reflectionGroupsInColumn = meetingReflectionGroups
    .filter((g) => g.promptId === promptId)
    .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
  let newSortOrder = 1e6
  const oldReflectionGroupIdx = reflectionGroupsInColumn.findIndex(
    (group) => group.id === oldReflectionGroup?.id
  )
  const sortOrderAtBottom =
    (reflectionGroupsInColumn[reflectionGroupsInColumn.length - 1]?.sortOrder ?? 1e6) +
    1 +
    dndNoise()
  if (
    oldReflectionGroupIdx === -1 ||
    !oldReflectionGroup ||
    reflection.promptId !== oldReflectionGroup.promptId
  ) {
    newSortOrder = sortOrderAtBottom
  } else if (oldReflectionGroupIdx === reflectionGroupsInColumn.length - 1) {
    newSortOrder = oldReflectionGroup.sortOrder + 1 + dndNoise()
  } else {
    const {sortOrder: oldSortOrder} = oldReflectionGroup
    const afterSortOrder = reflectionGroupsInColumn[oldReflectionGroupIdx + 1]?.sortOrder ?? 0
    newSortOrder = (oldSortOrder + afterSortOrder) / 2 + dndNoise()
  }

  const reflectionGroup = new ReflectionGroup({meetingId, promptId, sortOrder: newSortOrder})
  const {id: reflectionGroupId} = reflectionGroup
  await Promise.all([
    pg
      .with('Group', (qc) => qc.insertInto('RetroReflectionGroup').values(reflectionGroup))
      .updateTable('RetroReflection')
      .set({
        sortOrder: 0,
        reflectionGroupId
      })
      .where('id', '=', reflectionId)
      .execute()
  ])
  // mutates the dataloader response
  reflection.sortOrder = 0
  reflection.reflectionGroupId = reflectionGroupId
  const oldReflections = await dataLoader
    .get('retroReflectionsByGroupId')
    .load(oldReflectionGroupId)

  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  await updateGroupTitle({
    reflections: [reflection],
    reflectionGroupId: reflectionGroupId,
    meetingId,
    teamId: meeting.teamId,
    dataLoader
  })

  if (oldReflections.length > 0) {
    const oldReflectionGroup = await dataLoader
      .get('retroReflectionGroups')
      .loadNonNull(oldReflectionGroupId)
    const titleIsUserDefined =
      oldReflectionGroup.title !== oldReflectionGroup.smartTitle && oldReflectionGroup.title !== ''

    if (!titleIsUserDefined) {
      await updateGroupTitle({
        reflections: oldReflections,
        reflectionGroupId: oldReflectionGroupId,
        meetingId,
        teamId: meeting.teamId,
        dataLoader
      })
    }
  } else {
    await pg
      .updateTable('RetroReflectionGroup')
      .set({isActive: false})
      .where('id', '=', oldReflectionGroupId)
      .execute()
  }
  return reflectionGroupId
}

export default removeReflectionFromGroup
