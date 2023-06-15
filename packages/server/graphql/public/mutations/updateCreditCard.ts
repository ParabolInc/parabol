import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const updateCreditCard: MutationResolvers['updateCreditCard'] = async (
  _source,
  {},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()

  // VALIDATION

  // RESOLUTION
  const data = {}
  return data
}

export default updateCreditCard
