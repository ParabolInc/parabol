import {getUserById} from '../../../postgres/queries/getUsersByIds'
import updateUser from '../../../postgres/queries/updateUser'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const toggleSummaryEmail: MutationResolvers['toggleSummaryEmail'] = async (
  _source,
  {},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()
  const viewer = await getUserById(viewerId)
  console.log('🚀 ~ viewer', viewer)

  // VALIDATION

  // RESOLUTION
  await updateUser({sendSummaryEmail: false}, viewerId)

  const data = {}
  return data
}

export default toggleSummaryEmail
