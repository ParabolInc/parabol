import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {AnyMeeting} from '../../../postgres/types/Meeting'

const removeEmptyReflections = async (meeting: AnyMeeting, dataLoader: DataLoaderInstance) => {
  const pg = getKysely()
  const {id: meetingId} = meeting
  const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  dataLoader.get('retroReflectionsByMeetingId').clear(meetingId)
  dataLoader.get('retroReflections').clearAll()
  const emptyReflectionGroupIds = [] as string[]
  const emptyReflectionIds = [] as string[]
  reflections.forEach((reflection) => {
    const text = extractTextFromDraftString(reflection.content)
    if (text.length === 0) {
      emptyReflectionGroupIds.push(reflection.reflectionGroupId)
      emptyReflectionIds.push(reflection.id)
    }
  })
  if (emptyReflectionGroupIds.length > 0) {
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
  return {emptyReflectionGroupIds}
}

export default removeEmptyReflections
