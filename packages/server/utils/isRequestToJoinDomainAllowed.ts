import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {User} from '../postgres/types'
import isUserVerified from './isUserVerified'

export const getEligibleOrgIdsByDomain = async (
  activeDomain: string,
  userId: string,
  dataLoader: DataLoaderInstance
) => {
  const isCompanyDomain = await dataLoader.get('isCompanyDomain').load(activeDomain)
  if (!isCompanyDomain) {
    return []
  }

  const orgs = await dataLoader.get('organizationsByActiveDomain').load(activeDomain)
  if (orgs.length === 0) return []

  const viewerOrgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const viewerOrgIds = viewerOrgUsers.map(({orgId}) => orgId)
  const newOrgs = orgs.filter((org) => !viewerOrgIds.includes(org.id))
  if (newOrgs.length === 0) return []

  const verifiedOrgMask = await Promise.all(
    newOrgs.map(({id}) => dataLoader.get('isOrgVerified').load(id))
  )
  const verifiedOrgs = newOrgs.filter((_, idx) => verifiedOrgMask[idx])
  const verifiedOrgsWithActiveUserCount = await Promise.all(
    verifiedOrgs.map(async (org) => {
      const activeOrgUsers = await dataLoader.get('activeOrganizationUsersByOrgId').load(org.id)
      return {
        ...org,
        activeMembers: activeOrgUsers.length
      }
    })
  )

  const highestTierOrgs = verifiedOrgsWithActiveUserCount.reduce(
    (acc, org) => {
      if (acc.length === 0) {
        return [org]
      }
      const highestTier = acc[0]!.tier
      if (org.tier === highestTier) {
        return [...acc, org]
      }
      if (org.tier === 'enterprise') {
        return [org]
      }
      if (highestTier === 'starter' && org.tier === 'team') {
        return [org]
      }
      return acc
    },
    [] as typeof verifiedOrgsWithActiveUserCount
  )

  const biggestSize = highestTierOrgs.reduce(
    (acc, org) => (org.activeMembers > acc ? org.activeMembers : acc),
    0
  )
  return highestTierOrgs
    .filter(({activeMembers}) => activeMembers === biggestSize)
    .map(({id}) => id)
}

const isRequestToJoinDomainAllowed = async (
  domain: string,
  user: Pick<User, 'identities' | 'id'>,
  dataLoader: DataLoaderWorker
) => {
  if (!isUserVerified(user)) return false

  const orgIds = await getEligibleOrgIdsByDomain(domain, user.id, dataLoader)
  return orgIds.length > 0
}

export default isRequestToJoinDomainAllowed
