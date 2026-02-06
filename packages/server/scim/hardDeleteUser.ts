import SCIMMY from 'scimmy'
import removeFromOrg from '../graphql/mutations/helpers/removeFromOrg'
import {hardDeleteUser as hardDeleteUserHelper} from '../graphql/private/mutations/helpers/hardDeleteUser'
import {SCIMContext} from './SCIMContext'

export const hardDeleteUser = async ({
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
  if (isManaged) {
    await hardDeleteUserHelper(user, 'Deleted via SCIM', dataLoader)
    return
  }

  // all other users can only be removed from the managed org
  if (orgId) {
    await removeFromOrg(userId, orgId, undefined, dataLoader)
  }
}
