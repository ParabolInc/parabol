import getPg from '../getPg'
import {updateDomainsInOrganizationApprovedDomainQuery} from './generated/updateDomainsInOrganizationApprovedDomainQuery'

const updateDomainsInOrganizationApprovedDomainToPG = async (
  oldDomain: string,
  newDomain: string
) => {
  return updateDomainsInOrganizationApprovedDomainQuery.run({oldDomain, newDomain}, getPg())
}
export default updateDomainsInOrganizationApprovedDomainToPG
