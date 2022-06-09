import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../../public/resolverTypes'

const removeAuthIdentity: MutationResolvers['removeAuthIdentity'] = async (
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

export default removeAuthIdentity
