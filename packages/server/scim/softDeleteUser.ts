import SCIMMY from 'scimmy'
import removeFromOrg from '../graphql/mutations/helpers/removeFromOrg'
import softDeleteUserHelper from '../graphql/mutations/helpers/softDeleteUser'
import getKysely from '../postgres/getKysely'
import {analytics} from '../utils/analytics/analytics'
import {SCIMContext} from './SCIMContext'
import {getUserCategory} from './UserCategory'

export const softDeleteUser = async ({
  userId,
  scimId,
  dataLoader
}: {
  userId: string
  scimId: string
  dataLoader: SCIMContext['dataLoader']
}) => {
  const saml = await dataLoader.get('saml').loadNonNull(scimId)
  const [user, category] = await Promise.all([
    dataLoader.get('users').load(userId),
    getUserCategory(userId, saml, dataLoader)
  ])

  if (!user || !category) {
    throw new SCIMMY.Types.Error(404, '', 'User not found')
  }

  const {orgId} = saml

  if (user.isRemoved) {
    if (category !== 'managed') {
      throw new SCIMMY.Types.Error(404, '', 'User not found')
    }
    return user
  }

  // only users managed by this SCIM provider can be deleted
  if (category === 'managed') {
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

  // From the view of the SCIM client the user was removed as they're not managed by this SCIM provider anymore
  return {
    ...user,
    isRemoved: true
  }
}
