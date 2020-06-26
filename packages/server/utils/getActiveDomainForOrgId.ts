import getRethink from '../database/rethinkDriver'
import getDomainFromEmail from './getDomainFromEmail'
import isCompanyDomain from './isCompanyDomain'

const getGroupMajority = (tlds: string[]) => {
  const countByDomain = {} as {[tld: string]: number}
  tlds.forEach((tld) => {
    countByDomain[tld] = countByDomain[tld] || 0
    countByDomain[tld]++
  })
  let maxCount = 0
  let maxDomain = ''
  Object.keys(countByDomain).forEach((tld) => {
    const curCount = countByDomain[tld]
    if (curCount > maxCount) {
      maxCount = curCount
      maxDomain = tld
    }
  })
  return maxDomain || undefined
}

const getActiveDomainForOrgId = async (orgId: string) => {
  const r = await getRethink()
  const emails = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .map((row) => r.table('User').get(row('userId'))('email'))
    .run()

  const domains = emails.map(getDomainFromEmail)
  const companyDomains = domains.filter(isCompanyDomain)
  return getGroupMajority(companyDomains)
}

export default getActiveDomainForOrgId
