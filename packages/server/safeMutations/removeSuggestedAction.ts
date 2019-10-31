import getRethink from '../database/rethinkDriver'

const removeSuggestedAction = async (userId: string, type: string) => {
  const r = await getRethink()
  return r
    .table('SuggestedAction')
    .getAll(userId, {index: 'userId'})
    .filter({removedAt: null, type})
    .update({removedAt: new Date()}, {returnChanges: true})('changes')(0)('new_val')('id')
    .default(null)
    .run()
}
export default removeSuggestedAction
