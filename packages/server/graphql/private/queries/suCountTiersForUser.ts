import countTiersForUserId from '../../queries/helpers/countTiersForUserId'
import type {QueryResolvers} from '../resolverTypes'

const suCountTiersForUser: QueryResolvers['suCountTiersForUser'] = async (
  _source,
  {userId},
  {dataLoader}
) => {
  return {
    ...(await countTiersForUserId(userId, dataLoader)),
    userId
  }
}

export default suCountTiersForUser
