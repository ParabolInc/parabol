import getRethink from '../database/rethinkDriver'

const removeCreateNewTeamSuggestedAction = (userId) => {
  const r = getRethink()
  return r
    .table('SuggestedAction')
    .getAll(userId, {index: 'userId'})
    .filter({removedAt: null, type: 'createNewTeam'})
    .update({removedAt: new Date()}, {returnChanges: true})('changes')(0)('new_val')('id')
    .default(null)
}
export default removeCreateNewTeamSuggestedAction
