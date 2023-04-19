import isCompanyDomain from './isCompanyDomain'
import getRethink from '../database/rethinkDriver'

const hasEligibleOrg = async (activeDomain: string) => {
  const r = await getRethink()

  const orgsOnDomain = await r
    .table('Organization')
    .getAll(activeDomain, {index: 'activeDomain'})
    .filter((org) => org('featureFlags').contains('promptToJoinOrg'))
    .filter((org) => org('tier').ne('enterprise'))
    .run()

  console.log('orgsOnDomain', orgsOnDomain)

  const orgsOnDomainWithMoreThanOneUser = await r
    .table('Organization')
    .getAll(activeDomain, {index: 'activeDomain'})
    .filter((org) => org('featureFlags').contains('promptToJoinOrg'))
    .filter((org) => org('tier').ne('enterprise'))
    .filter((org) =>
      r
        .table('OrganizationUser')
        .getAll(org('id'), {index: 'orgId'})
        .filter({inactive: false, removedAt: null})
        .count()
        .gt(1)
    )
    .run()

  console.log('orgsOnDomainWithMoreThanOneUser', orgsOnDomainWithMoreThanOneUser)

  return r
    .table('Organization')
    .getAll(activeDomain, {index: 'activeDomain'})
    .filter((org) => org('featureFlags').contains('promptToJoinOrg'))
    .filter((org) => org('tier').ne('enterprise'))
    .filter((org) =>
      r
        .table('OrganizationUser')
        .getAll(org('id'), {index: 'orgId'})
        .filter({inactive: false, removedAt: null})
        .count()
        .gt(1)
    )
    .limit(1)
    .count()
    .gt(0)
    .run()
}

const isRequestToJoinDomainAllowed = async (domain: string) => {
  console.log('isRequestToJoinDomainAllowed domain:', domain)
  if (!isCompanyDomain(domain)) {
    console.log('Not a company domain, skip')
    return false
  }

  if (!(await hasEligibleOrg(domain))) {
    console.log('No matching org, skip')
    return false
  }

  console.log('All good sending notification')

  return true
}

export default isRequestToJoinDomainAllowed
