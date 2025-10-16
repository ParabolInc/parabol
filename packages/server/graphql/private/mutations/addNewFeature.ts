import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const addNewFeature: MutationResolvers['addNewFeature'] = async (
  _source,
  {actionButtonCopy, snackbarMessage, url}
) => {
  const pg = getKysely()

  // AUTH

  // RESOLUTION
  const newFeatureRes = await pg
    .with('NewFeatureInsert', (qb) =>
      qb.insertInto('NewFeature').values({actionButtonCopy, snackbarMessage, url}).returning('id')
    )
    .updateTable('User')
    .set((eb) => ({
      newFeatureId: eb.selectFrom('NewFeatureInsert').select('NewFeatureInsert.id')
    }))
    .returning((eb) => [eb.selectFrom('NewFeatureInsert').select('NewFeatureInsert.id').as('id')])
    .executeTakeFirstOrThrow()

  const newFeature = {
    actionButtonCopy,
    snackbarMessage,
    url,
    id: newFeatureRes.id!
  }
  // We could publish to all online users, if we start using this mutation again
  return {newFeature}
}

export default addNewFeature
