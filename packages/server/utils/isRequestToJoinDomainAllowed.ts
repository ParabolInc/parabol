import isCompanyDomain from './isCompanyDomain'
import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'

export const getEligibleOrgIdsByDomain = async (
  activeDomain: string,
  viewerId: string,
  limit?: number
) => {
  const BIG_ENOUGH_LIMIT = 9999

  if (!isCompanyDomain(activeDomain)) {
    return []
  }

  const r = await getRethink()

  return r
    .table('Organization')
    .getAll(activeDomain, {index: 'activeDomain'})
    .filter((org) => org('featureFlags').contains('promptToJoinOrg'))
    .filter((org) =>
      r
        .table('OrganizationUser')
        .getAll(org('id'), {index: 'orgId'})
        .filter({inactive: false, removedAt: null})
        .coerceTo('array')
        .do((orgUsers: RDatum) =>
          orgUsers
            .count()
            .gt(1)
            .and(orgUsers.filter((ou) => ou('userId').eq(viewerId)).isEmpty())
        )
    )
    .limit(limit ?? BIG_ENOUGH_LIMIT)('id')
    .run()
}

const isRequestToJoinDomainAllowed = async (domain: string, viewerId: string) => {
  const orgIds = await getEligibleOrgIdsByDomain(domain, viewerId, 1)
  return orgIds.length > 0
}

export default isRequestToJoinDomainAllowed
