import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'

const removeEmptyReflectionGroup = async (
  reflectionGroupId: string,
  oldReflectionGroupId: string
) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  if (!reflectionGroupId) return false
  const reflectionCount = await r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .count()
    .run()
  if (reflectionCount > 0) return

  return Promise.all([
    pg
      .updateTable('RetroReflectionGroup')
      .set({isActive: false})
      .where('id', '=', oldReflectionGroupId)
      .execute(),
    r
      .table('RetroReflectionGroup')
      .get(oldReflectionGroupId)
      .update({isActive: false, updatedAt: now})
      .run()
  ])
}

export default removeEmptyReflectionGroup
