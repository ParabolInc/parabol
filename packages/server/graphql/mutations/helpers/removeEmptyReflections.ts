import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {AnyMeeting} from '../../../postgres/types/Meeting'

const removeEmptyReflections = async (meeting: AnyMeeting, dataLoader: DataLoaderInstance) => {
  const pg = getKysely()
  const {id: meetingId} = meeting

  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])

  dataLoader.get('retroReflectionsByMeetingId').clear(meetingId)
  dataLoader.get('retroReflections').clearAll()

  const emptyReflectionIds: string[] = []
  const emptyReflectionGroupIds: string[] = []
  reflections.forEach((reflection) => {
    if (!reflection.plaintextContent.trim()) {
      emptyReflectionIds.push(reflection.id)
      emptyReflectionGroupIds.push(reflection.reflectionGroupId)
    }
  })

  if (emptyReflectionIds.length > 0) {
    await Promise.all([
      pg
        .updateTable('RetroReflection')
        .set({isActive: false})
        .where('id', 'in', emptyReflectionIds)
        .execute(),
      pg
        .updateTable('RetroReflectionGroup')
        .set({isActive: false})
        .where('id', 'in', emptyReflectionGroupIds)
        .execute()
    ])
  }

  const inactiveReflections = new Set(emptyReflectionIds)
  const groupsWithNoActiveReflections = reflectionGroups
    .filter(
      (group) =>
        !reflections.some((r) => r.reflectionGroupId === group.id && !inactiveReflections.has(r.id))
    )
    .map((group) => group.id)

  if (groupsWithNoActiveReflections.length > 0) {
    await pg
      .updateTable('RetroReflectionGroup')
      .set({isActive: false})
      .where('id', 'in', groupsWithNoActiveReflections)
      .execute()
  }

  return {emptyReflectionGroupIds}
}

export default removeEmptyReflections
