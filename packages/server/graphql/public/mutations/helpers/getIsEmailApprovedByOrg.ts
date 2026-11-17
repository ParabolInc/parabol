import type {DataLoaderWorker} from '../../../graphql'

// An approval is an exact domain, a wildcard like *.example.com (which also covers example.com), or a single address
export const isEmailOnApprovedList = (email: string, approvedDomains: string[]) => {
  const normalizedEmail = email.toLowerCase()
  const exactDomain = normalizedEmail.slice(normalizedEmail.indexOf('@') + 1)
  return approvedDomains.some((approvedDomain) => {
    if (approvedDomain === exactDomain || approvedDomain === normalizedEmail) return true
    if (!approvedDomain.startsWith('*.')) return false
    const baseDomain = approvedDomain.slice(2)
    return exactDomain === baseDomain || exactDomain.endsWith(`.${baseDomain}`)
  })
}

export const getIsEmailApprovedByOrg = async (
  email: string,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const approvedDomains = await dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  if (approvedDomains.length === 0) return undefined
  if (!isEmailOnApprovedList(email, approvedDomains)) {
    const domainList = approvedDomains.join(', ')
    const message = `Cannot accept invitation. Your email must end with ${domainList}`
    return new Error(message)
  }
  return undefined
}
