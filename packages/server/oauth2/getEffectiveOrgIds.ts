import type {DataLoaderWorker} from '../graphql/graphql'
import type {OAuthAPIProvider} from '../postgres/types'

interface Input {
  provider: Pick<OAuthAPIProvider, 'orgId'>
  grantedOrgIds: string[] | null
  userId: string
  dataLoader: DataLoaderWorker
}

const getEffectiveOrgIds = async ({
  provider,
  grantedOrgIds,
  userId,
  dataLoader
}: Input): Promise<string[]> => {
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const currentOrgIds = organizationUsers.map(({orgId}) => orgId)
  if (provider.orgId) return currentOrgIds.includes(provider.orgId) ? [provider.orgId] : []
  return grantedOrgIds
    ? currentOrgIds.filter((orgId) => grantedOrgIds.includes(orgId))
    : currentOrgIds
}

export default getEffectiveOrgIds
