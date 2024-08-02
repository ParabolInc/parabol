import {sql} from 'kysely'
import getRethink from '../database/rethinkDriver'
import getKysely from '../postgres/getKysely'
import {SuggestedAction} from '../postgres/pg'

const removeSuggestedAction = async (userId: string, type: SuggestedAction['type']) => {
  const r = await getRethink()
  await getKysely()
    .updateTable('SuggestedAction')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('userId', '=', userId)
    .where('type', '=', type)
    .execute()
  return r
    .table('SuggestedAction')
    .getAll(userId, {index: 'userId'})
    .filter({removedAt: null, type})
    .update({removedAt: new Date()}, {returnChanges: true})('changes')(0)('new_val')('id')
    .default(null)
    .run()
}
export default removeSuggestedAction
