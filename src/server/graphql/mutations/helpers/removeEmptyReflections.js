import getRethink from 'server/database/rethinkDriver'
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString'

const removeEmptyReflections = async (meeting) => {
  const r = getRethink()
  const {id: meetingId} = meeting
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})
  const emptyReflectionGroupIds = []
  const emptyReflectionIds = []
  reflections.forEach((reflection) => {
    const text = extractTextFromDraftString(reflection.content)
    if (text.length === 0) {
      emptyReflectionGroupIds.push(reflection.reflectionGroupId)
      emptyReflectionIds.push(reflection.id)
    }
  })
  if (emptyReflectionGroupIds.length > 0) {
    await r({
      reflections: r
        .table('RetroReflection')
        .getAll(r.args(emptyReflectionIds), {index: 'id'})
        .update({
          isActive: false
        }),
      reflectionGroups: r
        .table('RetroReflectionGroup')
        .getAll(r.args(emptyReflectionGroupIds), {index: 'id'})
        .update({
          isActive: false
        })
    })
  }
  return {emptyReflectionGroupIds}
}

export default removeEmptyReflections
