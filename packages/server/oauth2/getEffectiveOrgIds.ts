import type {DataLoaderWorker} from '../graphql/graphql'
import type {OAuthAPIProvider} from '../postgres/types'
import isAIAppAllowedByOrg from './isAIAppAllowedByOrg'

interface Input {
  provider: Pick<OAuthAPIProvider, 'orgId' | 'verifiedAt'>
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
  const grantedCurrentOrgIds = grantedOrgIds
    ? currentOrgIds.filter((orgId) => grantedOrgIds.includes(orgId))
    : currentOrgIds
  const orgs = await dataLoader.get('organizations').loadMany(grantedCurrentOrgIds)
  return grantedCurrentOrgIds.filter((_orgId, idx) => {
    const org = orgs[idx]
    return org && !(org instanceof Error) && isAIAppAllowedByOrg(org, provider)
  })
}

export default getEffectiveOrgIds
