import {isEmailOnApprovedList} from '../../../../../client/shared/approvedDomains'
import type {DataLoaderWorker} from '../../../graphql'

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
