import SAML from '../database/types/SAML'
import {DataLoaderWorker} from '../graphql/graphql'

export type UserCategory = 'managed' | 'external' | null

export const getUserCategory = async (
  userId: string,
  saml: Pick<SAML, 'id' | 'orgId' | 'domains'>,
  dataLoader: DataLoaderWorker
): Promise<UserCategory> => {
  if (!userId) {
    return null
  }
  const user = await dataLoader.get('users').load(userId)
  if (!user) {
    return null
  }

  const {id: scimId, domains, orgId} = saml

  if (user.scimId === scimId || domains.includes(user.domain!)) {
    return 'managed'
  }

  if (!orgId) {
    return null
  }

  const orgUsers = await dataLoader.get('organizationUsersByOrgId').load(saml.orgId!)
  if (orgUsers.some(({userId}) => userId === user.id)) {
    return 'external'
  }

  return null
}
