import {getUserById} from '../../../postgres/queries/getUsersByIds'
import updateUser from '../../../postgres/queries/updateUser'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const toggleSummaryEmail: MutationResolvers['toggleSummaryEmail'] = async (
  _source,
  {},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()
  const viewer = await getUserById(viewerId)
  console.log('🚀 ~ viewer', viewer)
  if (!viewer) return standardError(new Error('User not found'), {userId: viewerId})

  // RESOLUTION
  const {sendSummaryEmail} = viewer
  await updateUser({sendSummaryEmail: !sendSummaryEmail}, viewerId)

  return true
}

export default toggleSummaryEmail
