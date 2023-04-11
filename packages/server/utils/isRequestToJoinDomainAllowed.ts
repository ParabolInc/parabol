import isCompanyDomain from "./isCompanyDomain";
import getRethink from "../database/rethinkDriver";

const hasEligibleOrg = async (activeDomain: string) => {
  const r = await getRethink()
  return r.table('Organization')
    .getAll(activeDomain, { index: 'activeDomain' })
    .filter(org => org('featureFlags').contains('promptToJoinOrg'))
    .filter(org => org('tier').ne('enterprise'))
    .filter(org =>
      r.table('OrganizationUser')
        .getAll(org('id'), { index: 'orgId' })
        .filter({ inactive: false, removedAt: null })
        .count()
        .gt(1)
    )
    .limit(1)
    .count()
    .gt(0)
    .run();
}

const isRequestToJoinDomainAllowed = async (domain: string) => {
  if (!isCompanyDomain(domain)) {
    return false
  }

  if (!(await hasEligibleOrg(domain))) {
    return false
  }

  return true
}


export default isRequestToJoinDomainAllowed