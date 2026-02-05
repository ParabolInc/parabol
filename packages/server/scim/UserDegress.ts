import SCIMMY from 'scimmy'
import removeFromOrg from '../graphql/mutations/helpers/removeFromOrg'
import softDeleteUser from '../graphql/mutations/helpers/softDeleteUser'
import getKysely from '../postgres/getKysely'
import {analytics} from '../utils/analytics/analytics'
import {logSCIMRequest} from './logSCIMRequest'
import {SCIMContext} from './SCIMContext'

SCIMMY.Resources.declare(SCIMMY.Resources.User).degress(async (resource, ctx: SCIMContext) => {
  const {ip, authToken, dataLoader} = ctx
  const scimId = authToken.sub!
  const {id: userId} = resource

  logSCIMRequest(scimId, ip, {operation: `User degress`, userId})

  if (!userId) {
    throw new SCIMMY.Types.Error(400, 'invalidValue', 'User ID is required for degress')
  }

  const [user, saml] = await Promise.all([
    dataLoader.get('users').load(userId),
    dataLoader.get('saml').loadNonNull(scimId)
  ])

  if (!user || user.isRemoved) {
    throw new SCIMMY.Types.Error(404, '', 'User not found')
  }

  const {domains, orgId} = saml

  // only users managed by this SCIM provider can be deleted
  if (user.scimId === scimId || domains.includes(user.domain!)) {
    const deletedUserEmail = await softDeleteUser(userId, dataLoader)
    const reasonRemoved = 'Deleted via SCIM'
    const pg = getKysely()
    await pg
      .updateTable('User')
      .set({
        isRemoved: true,
        reasonRemoved,
        updatedAt: new Date(),
        email: deletedUserEmail
      })
      .where('id', '=', userId)
      .execute()

    analytics.accountRemoved(user, reasonRemoved)

    return
  }

  // all users can be removed from the managed org
  if (orgId) {
    await removeFromOrg(userId, orgId, undefined, dataLoader)
  }
  return
})
