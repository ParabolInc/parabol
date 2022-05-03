import {DataLoaderWorker} from '../../../graphql'

const getIsEmailApprovedByOrg = async (
  email: string,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const approvedDomains = await dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  if (approvedDomains.length === 0) return undefined
  const isApproved = approvedDomains.some((domain) => email.endsWith(domain))
  if (!isApproved) {
    const domainList = approvedDomains.join(', ')
    const message = `Cannot accept invitation. Your email must end with ${domainList}`
    return new Error(message)
  }
  return undefined
}

export default getIsEmailApprovedByOrg
