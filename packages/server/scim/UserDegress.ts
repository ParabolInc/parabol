import SCIMMY from 'scimmy'
import removeFromOrg from '../graphql/mutations/helpers/removeFromOrg'
import softDeleteUser from '../graphql/mutations/helpers/softDeleteUser'
import getKysely from '../postgres/getKysely'
import {analytics} from '../utils/analytics/analytics'
import {SCIMContext} from './SCIMContext'

SCIMMY.Resources.declare(SCIMMY.Resources.User).degress(async (resource, ctx: SCIMContext) => {
  const {authToken, dataLoader} = ctx
  const {id} = resource
  if (!id) {
    throw new SCIMMY.Types.Error(400, 'invalidValue', 'User ID is required for degress')
  }
  console.log('GEORG User degress', resource)

  const scimId = authToken.sub!
  const pg = getKysely()

  const [user, saml] = await Promise.all([
    dataLoader.get('users').load(id),
    dataLoader.get('saml').loadNonNull(scimId)
  ])

  if (!user || user.isRemoved) {
    throw new SCIMMY.Types.Error(404, '', 'User not found')
  }

  const {domains, orgId} = saml

  // only users managed by this SCIM provider can be deleted
  if (user.scimId === scimId || domains.includes(user.domain!)) {
    const deletedUserEmail = await softDeleteUser(id, dataLoader)
    const reasonRemoved = 'Deleted via SCIM'
    await pg
      .updateTable('User')
      .set({
        isRemoved: true,
        reasonRemoved,
        updatedAt: new Date(),
        email: deletedUserEmail
      })
      .where('id', '=', id)
      .execute()

    analytics.accountRemoved(user, reasonRemoved)

    return
  }

  // all users can be removed from the managed org
  if (orgId) {
    await removeFromOrg(id, orgId, undefined, dataLoader)
  }
  return
})
