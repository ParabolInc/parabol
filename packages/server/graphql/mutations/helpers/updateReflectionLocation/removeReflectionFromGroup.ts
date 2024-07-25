import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import dndNoise from '../../../../../client/utils/dndNoise'
import getRethink from '../../../../database/rethinkDriver'
import MeetingRetrospective from '../../../../database/types/MeetingRetrospective'
import ReflectionGroup from '../../../../database/types/ReflectionGroup'
import getKysely from '../../../../postgres/getKysely'
import {GQLContext} from '../../../graphql'
import updateSmartGroupTitle from './updateSmartGroupTitle'

const removeReflectionFromGroup = async (reflectionId: string, {dataLoader}: GQLContext) => {
  const r = await getRethink()
  const pg = getKysely()
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) throw new Error('Reflection not found')
  const {reflectionGroupId: oldReflectionGroupId, meetingId, promptId} = reflection
  const [meetingReflectionGroups, meeting] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  dataLoader.get('retroReflectionGroupsByMeetingId').clear(meetingId)
  dataLoader.get('retroReflectionGroups').clearAll()
  const oldReflectionGroup = meetingReflectionGroups.find((g) => g.id === oldReflectionGroupId)!
  const reflectionGroupsInColumn = meetingReflectionGroups
    .filter((g) => g.promptId === promptId)
    .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
  let newSortOrder = 1e6
  const oldReflectionGroupIdx = reflectionGroupsInColumn.findIndex(
    (group) => group.id === oldReflectionGroup.id
  )
  const sortOrderAtBottom =
    (reflectionGroupsInColumn[reflectionGroupsInColumn.length - 1]?.sortOrder ?? 1e6) +
    1 +
    dndNoise()
  if (oldReflectionGroupIdx === -1 || reflection.promptId !== oldReflectionGroup.promptId) {
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
      .execute(),
    r.table('NewMeeting').get(meetingId).update({nextAutoGroupThreshold: null}).run()
  ])
  // mutates the dataloader response
  reflection.sortOrder = 0
  reflection.reflectionGroupId = reflectionGroupId
  const retroMeeting = meeting as MeetingRetrospective
  retroMeeting.nextAutoGroupThreshold = null
  const oldReflections = await dataLoader
    .get('retroReflectionsByGroupId')
    .load(oldReflectionGroupId)

  const nextTitle = getGroupSmartTitle([reflection])
  await updateSmartGroupTitle(reflectionGroupId, nextTitle)

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
  return reflectionGroupId
}

export default removeReflectionFromGroup
