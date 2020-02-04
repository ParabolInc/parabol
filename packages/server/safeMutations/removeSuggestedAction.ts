import getRethink from '../database/rethinkDriver'
import {SuggestedActionTypeEnum} from 'parabol-client/types/graphql'

const removeSuggestedAction = async (userId: string, type: SuggestedActionTypeEnum) => {
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
