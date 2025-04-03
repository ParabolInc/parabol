import {DataLoaderWorker} from '../../../graphql'

const getIsEmailApprovedByOrg = async (
  email: string,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const approvedDomains = await dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  if (approvedDomains.length === 0) return undefined
  const exactDomain = email.split('@')[1]!

  // search for wildcards, too
  const [tld, domain] = exactDomain.split('.').reverse()
  const wildcardDomain = `*.${domain}.${tld}`
  const isApproved = approvedDomains.some(
    (approvedDomain) => exactDomain === approvedDomain || approvedDomain === wildcardDomain
  )

  if (!isApproved) {
    const domainList = approvedDomains.join(', ')
    const message = `Cannot accept invitation. Your email must end with ${domainList}`
    return new Error(message)
  }
  return undefined
}

export default getIsEmailApprovedByOrg
