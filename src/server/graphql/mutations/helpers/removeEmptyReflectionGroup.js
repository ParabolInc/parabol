import getRethink from 'server/database/rethinkDriver'

const removeEmptyReflectionGroup = (reflectionGroupId, oldReflectionGroupId) => {
  const r = getRethink()
  const now = new Date()
  if (!reflectionGroupId) return false
  return r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .count()
    .do((len) => {
      return r.branch(
        len.eq(0),
        r
          .table('RetroReflectionGroup')
          .get(oldReflectionGroupId)
          .update({
            isActive: false,
            updatedAt: now
          }),
        null
      )
    })
}

export default removeEmptyReflectionGroup
