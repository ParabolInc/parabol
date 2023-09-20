import isCompanyDomain from './isCompanyDomain'
import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import isUserVerified from './isUserVerified'
import User from '../database/types/User'
import {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import TeamMember from '../database/types/TeamMember'

export const getEligibleOrgIdsByDomain = async (
  activeDomain: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  if (!isCompanyDomain(activeDomain)) {
    return []
  }

  const r = await getRethink()

  const orgs = await r
    .table('Organization')
    .getAll(activeDomain, {index: 'activeDomain'})
    .merge((org: RDatum) => ({
      members: r
        .table('OrganizationUser')
        .getAll(org('id'), {index: 'orgId'})
        .orderBy('joinedAt')
        .coerceTo('array')
    }))
    .merge((org: RDatum) => ({
      founder: org('members').nth(0).default(null),
      billingLeads: org('members').filter({role: 'BILLING_LEADER', inactive: false}),
      activeMembers: org('members').filter({inactive: false, removedAt: null}).count()
    }))
    .filter((org: RDatum) =>
      org('activeMembers').gt(0).and(org('members').filter({userId}).isEmpty())
    )
    .run()

  const eligibleOrgs = await Promise.all(
    orgs.map(async (org) => {
      const {founder} = org
      const importantMembers = org.billingLeads.slice() as TeamMember[]
      if (!founder.inactive && !founder.removedAt && founder.role !== 'BILLING_LEADER') {
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
  )
  return eligibleOrgs.filter(isValid).map(({id}) => id)
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
