import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import Organization from '../database/types/Organization'
import TeamMember from '../database/types/TeamMember'
import User from '../database/types/User'
import {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import isUserVerified from './isUserVerified'

export const getEligibleOrgIdsByDomain = async (
  activeDomain: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  const isCompanyDomain = await dataLoader.get('isCompanyDomain').load(activeDomain)
  if (!isCompanyDomain) {
    return []
  }

  const r = await getRethink()

  const orgs = await r
    .table('Organization')
    .getAll(activeDomain, {index: 'activeDomain'})
    .filter((org: RDatum) => org('featureFlags').default([]).contains('noPromptToJoinOrg').not())
    .merge((org: RDatum) => ({
      members: r
        .table('OrganizationUser')
        .getAll(org('id'), {index: 'orgId'})
        .orderBy('joinedAt')
        .coerceTo('array')
    }))
    .merge((org: RDatum) => ({
      founder: org('members').nth(0).default(null),
      billingLeads: org('members')
        .filter({inactive: false, removedAt: null})
        .filter((row: RDatum) => r.expr(['BILLING_LEADER', 'ORG_ADMIN']).contains(row('role'))),
      activeMembers: org('members').filter({inactive: false, removedAt: null}).count()
    }))
    .filter((org: RDatum) =>
      org('activeMembers').gt(1).and(org('members').filter({userId}).isEmpty())
    )
    .run()

  type OrgWithActiveMembers = Organization & {activeMembers: number}
  const eligibleOrgs = (await Promise.all(
    orgs.map(async (org) => {
      const {founder} = org
      const importantMembers = org.billingLeads.slice() as TeamMember[]
      if (
        !founder.inactive &&
        !founder.removedAt &&
        founder.role !== 'BILLING_LEADER' &&
        founder.role !== 'ORG_ADMIN'
      ) {
        importantMembers.push(founder)
      }

      const users = (
        await dataLoader.get('users').loadMany(importantMembers.map(({userId}) => userId))
      ).filter(isValid)
      if (
        !users.some((user) => user.email.split('@')[1] === activeDomain && isUserVerified(user))
      ) {
        return null
      }
      return org
    })
  )) as OrgWithActiveMembers[]

  const highestTierOrgs = eligibleOrgs.filter(isValid).reduce((acc, org) => {
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
  }, [] as OrgWithActiveMembers[])

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
  user: User,
  dataLoader: DataLoaderWorker
) => {
  if (!isUserVerified(user)) return false

  const orgIds = await getEligibleOrgIdsByDomain(domain, user.id, dataLoader)
  return orgIds.length > 0
}

export default isRequestToJoinDomainAllowed
