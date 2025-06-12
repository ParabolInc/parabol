import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'

const removeEmptyReflections = async (meetingId: string) => {
  const pg = getKysely()

  await pg
    .updateTable('RetroReflection')
    .set({isActive: false})
    .where('meetingId', '=', meetingId)
    .where(() => sql`btrim("plaintextContent", E' \t\n\r\f\v')`, '=', '')
    .execute()

  const emptyReflectionGroupRes = await pg
    .updateTable('RetroReflectionGroup')
    .set({isActive: false})
    .where('meetingId', '=', meetingId)
    .where(
      ({selectFrom, ref}) =>
        selectFrom('RetroReflection')
          .select(({fn}) => fn.countAll().as('count'))
          .where('reflectionGroupId', '=', ref('RetroReflectionGroup.id'))
          .where('isActive', '=', true),
      '=',
      0
    )
    .returning('id')
    .execute()
  const emptyReflectionGroupIds = emptyReflectionGroupRes.map(({id}) => id)
  return {emptyReflectionGroupIds}
}

export default removeEmptyReflections
