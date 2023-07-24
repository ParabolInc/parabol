import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getRethink from '../../../database/rethinkDriver'
import Meeting from '../../../database/types/Meeting'
import getKysely from '../../../postgres/getKysely'

const removeEmptyReflections = async (meeting: Meeting) => {
  const r = await getRethink()
  const pg = getKysely()
  const {id: meetingId} = meeting
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})
    .run()
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
      r
        .table('RetroReflection')
        .getAll(r.args(emptyReflectionIds), {index: 'id'})
        .update({
          isActive: false
        })
        .run(),
      pg
        .updateTable('RetroReflectionGroup')
        .set({isActive: false})
        .where('id', 'in', emptyReflectionGroupIds)
        .execute(),
      r
        .table('RetroReflectionGroup')
        .getAll(r.args(emptyReflectionGroupIds), {index: 'id'})
        .update({
          isActive: false
        })
        .run()
    ])
  }
  return {emptyReflectionGroupIds}
}

export default removeEmptyReflections
