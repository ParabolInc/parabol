import getGroupSmartTitle from 'parabol-client/utils/smartGroup/getGroupSmartTitle'
import dndNoise from '../../../../../client/utils/dndNoise'
import getRethink from '../../../../database/rethinkDriver'
import MeetingRetrospective from '../../../../database/types/MeetingRetrospective'
import ReflectionGroup from '../../../../database/types/ReflectionGroup'
import getKysely from '../../../../postgres/getKysely'
import {GQLContext} from '../../../graphql'
import updateSmartGroupTitle from './updateSmartGroupTitle'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'

const removeReflectionFromGroup = async (reflectionId: string, {dataLoader}: GQLContext) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const reflection = await dataLoader.get('retroReflections').load(reflectionId)
  if (!reflection) throw new Error('Reflection not found')
  const {reflectionGroupId: oldReflectionGroupId, meetingId, promptId} = reflection
  const [oldReflectionGroup, reflectionGroupsInColumn, meeting] = await Promise.all([
    dataLoader.get('retroReflectionGroups').load(oldReflectionGroupId),
    r
      .table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true, promptId})
      .orderBy('sortOrder')
      .run(),
    dataLoader.get('newMeetings').load(meetingId)
  ])

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
    pg.insertInto('RetroReflectionGroup').values(reflectionGroup).execute(),
    r.table('RetroReflectionGroup').insert(reflectionGroup).run(),
    r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        sortOrder: 0,
        reflectionGroupId,
        updatedAt: now
      })
      .run(),
    r.table('NewMeeting').get(meetingId).update({nextAutoGroupThreshold: null}).run()
  ])
  // mutates the dataloader response
  reflection.sortOrder = 0
  reflection.reflectionGroupId = reflectionGroupId
  const retroMeeting = meeting as MeetingRetrospective
  retroMeeting.nextAutoGroupThreshold = null
  const oldReflections = await r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .run()

  const manager = new OpenAIServerManager()
  const nextTitle =
    (await manager.getReflectionGroupTitle([reflection])) ?? getGroupSmartTitle([reflection])
  await updateSmartGroupTitle(reflectionGroupId, nextTitle)

  if (oldReflections.length > 0) {
    const oldTitle = getGroupSmartTitle(oldReflections)
    await updateSmartGroupTitle(oldReflectionGroupId, oldTitle)
  } else {
    await Promise.all([
      pg
        .updateTable('RetroReflectionGroup')
        .set({isActive: false})
        .where('id', '=', oldReflectionGroupId)
        .execute(),
      r
        .table('RetroReflectionGroup')
        .get(oldReflectionGroupId)
        .update({
          isActive: false,
          updatedAt: now
        })
        .run()
    ])
  }
  return reflectionGroupId
}

export default removeReflectionFromGroup
