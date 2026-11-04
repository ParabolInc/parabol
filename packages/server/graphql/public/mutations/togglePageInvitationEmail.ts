import {emailSubscriptionChanges} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const togglePageInvitationEmail: MutationResolvers['togglePageInvitationEmail'] = async (
  _source,
  _args,
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const viewer = await getUserById(viewerId)
  if (!viewer) return standardError(new Error('User not found'), {userId: viewerId})

  // RESOLUTION
  const {sendPageInvitationEmail} = viewer
  const pg = getKysely()
  await pg
    .updateTable('User')
    .set({sendPageInvitationEmail: !sendPageInvitationEmail})
    .where('id', '=', viewerId)
    .execute()
  emailSubscriptionChanges.inc({
    email: 'page_invitation',
    change: sendPageInvitationEmail ? 'unsubscribed' : 'subscribed'
  })

  return true
}

export default togglePageInvitationEmail
