import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const updateAutoJoin: MutationResolvers['updateAutoJoin'] = async (
  _source,
  {teamIds, autoJoin},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  console.log('🚀 ~ viewerId:', viewerId)
  const now = new Date()

  // VALIDATION

  // RESOLUTION
  const data = {}
  return data
}

export default updateAutoJoin
