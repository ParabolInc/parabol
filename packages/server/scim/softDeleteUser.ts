import SCIMMY from 'scimmy'
import removeFromOrg from '../graphql/mutations/helpers/removeFromOrg'
import softDeleteUserHelper from '../graphql/mutations/helpers/softDeleteUser'
import getKysely from '../postgres/getKysely'
import {analytics} from '../utils/analytics/analytics'
import {SCIMContext} from './SCIMContext'

export const softDeleteUser = async ({
  userId,
  scimId,
  dataLoader
}: {
  userId: string
  scimId: string
  dataLoader: SCIMContext['dataLoader']
}) => {
  const [user, saml] = await Promise.all([
    dataLoader.get('users').load(userId),
    dataLoader.get('saml').loadNonNull(scimId)
  ])

  if (!user) {
    throw new SCIMMY.Types.Error(404, '', 'User not found')
  }

  const {domains, orgId} = saml
  const isManaged = user.scimId === scimId || domains.includes(user.domain!)

  if (user.isRemoved) {
    if (!isManaged) {
      throw new SCIMMY.Types.Error(404, '', 'User not found')
    }
    return user
  }

  // only users managed by this SCIM provider can be deleted
  if (isManaged) {
    // we're not removing the email here to allow re-provisioning by just setting active=true again
    await softDeleteUserHelper(userId, dataLoader)
    const reasonRemoved = 'Deleted via SCIM'
    const pg = getKysely()
    const deletedUser = await pg
      .updateTable('User')
      .set({
        isRemoved: true,
        reasonRemoved
      })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirst()

    analytics.accountRemoved(user, reasonRemoved)

    return deletedUser
  }

  // all users can be removed from the managed org
  if (orgId) {
    await removeFromOrg(userId, orgId, undefined, dataLoader)
  }

  return user
}
