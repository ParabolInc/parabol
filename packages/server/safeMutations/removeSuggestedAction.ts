import getRethink from '../database/rethinkDriver'
import {TSuggestedActionTypeEnum} from '../graphql/types/SuggestedActionTypeEnum'

const removeSuggestedAction = async (userId: string, type: TSuggestedActionTypeEnum) => {
  const r = await getRethink()
  return r
    .table('SuggestedAction')
    .getAll(userId, {index: 'userId'})
    .filter({removedAt: null, type})
    .update(
      {removedAt: new Date()},
      {returnChanges: true}
    )('changes')(0)('new_val')('id')
    .default(null)
    .run()
}
export default removeSuggestedAction
