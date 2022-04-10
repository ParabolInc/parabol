import countTiersForUserId from '../../queries/helpers/countTiersForUserId'
import {QueryResolvers} from '../resolverTypes'

const suCountTiersForUser: QueryResolvers['suCountTiersForUser'] = async (_source, {userId}) => {
  return {
    ...(await countTiersForUserId(userId)),
    userId
  }
}

export default suCountTiersForUser
