import getKysely from '../../../postgres/getKysely'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const toggleSummaryEmail: MutationResolvers['toggleSummaryEmail'] = async (
  _source,
  _args,
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const viewer = await getUserById(viewerId)
  if (!viewer) return standardError(new Error('User not found'), {userId: viewerId})

  // RESOLUTION
  const {sendSummaryEmail} = viewer
  const pg = getKysely()
  await pg
    .updateTable('User')
    .set({sendSummaryEmail: !sendSummaryEmail})
    .where('id', '=', viewerId)
    .execute()
  analytics.toggleSubToSummaryEmail(viewer, !sendSummaryEmail)

  return true
}

export default toggleSummaryEmail
