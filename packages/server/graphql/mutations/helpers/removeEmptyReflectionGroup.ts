import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'

const removeEmptyReflectionGroup = async (
  reflectionGroupId: string,
  oldReflectionGroupId: string
) => {
  const r = await getRethink()
  const now = new Date()
  if (!reflectionGroupId) return false
  return r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .count()
    .do((len: RValue) => {
      return r.branch(
        len.eq(0),
        r.table('RetroReflectionGroup').get(oldReflectionGroupId).update({
          isActive: false,
          updatedAt: now
        }),
        null
      )
    })
    .run()
}

export default removeEmptyReflectionGroup
