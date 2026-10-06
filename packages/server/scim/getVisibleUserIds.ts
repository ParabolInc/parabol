import type {DataLoaderWorker} from '../graphql/graphql'
import type {SAMLSource} from '../graphql/public/types/SAML'
import {getUserCategory} from './UserCategory'

export const getVisibleUserIds = async (
  userIds: string[],
  saml: SAMLSource,
  dataLoader: DataLoaderWorker
) => {
  const categories = await Promise.all(
    userIds.map((userId) => getUserCategory(userId, saml, dataLoader))
  )
  return userIds.filter((_userId, idx) => categories[idx])
}
