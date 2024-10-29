import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import {SuggestedAction} from '../postgres/types/pg'

const removeSuggestedAction = async (userId: string, type: SuggestedAction['type']) => {
  const removedAction = await getKysely()
    .updateTable('SuggestedAction')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('userId', '=', userId)
    .where('type', '=', type)
    .returning('id')
    .executeTakeFirst()
  return removedAction?.id
}
export default removeSuggestedAction
