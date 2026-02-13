import SCIMMY from 'scimmy'
import removeFromOrg from '../graphql/mutations/helpers/removeFromOrg'
import {hardDeleteUser as hardDeleteUserHelper} from '../graphql/private/mutations/helpers/hardDeleteUser'
import {Logger} from '../utils/Logger'
import {SCIMContext} from './SCIMContext'
import {getUserCategory} from './UserCategory'

export const hardDeleteUser = async ({
  userId,
  scimId,
  dataLoader
}: {
  userId: string
  scimId: string
  dataLoader: SCIMContext['dataLoader']
}) => {
  const saml = await dataLoader.get('saml').loadNonNull(scimId)
  const {orgId} = saml

  const [user, category] = await Promise.all([
    dataLoader.get('users').load(userId),
    getUserCategory(userId, saml, dataLoader)
  ])

  if (!user || !category) {
    throw new SCIMMY.Types.Error(404, '', 'User not found')
  }

  try {
    if (category === 'managed') {
      await hardDeleteUserHelper(user, 'Deleted via SCIM', dataLoader)
      return
    }

    // all other users can only be removed from the managed org
    if (orgId) {
      await removeFromOrg(userId, orgId, undefined, dataLoader)
    }
  } catch (error) {
    Logger.error('Failed to hard delete user', {error, userId, scimId})
    throw new SCIMMY.Types.Error(500, 'internalError', 'Failed to hard delete user')
  }
}
