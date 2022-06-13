import getPg from '../getPg'
import {removeApprovedOrganizationDomainsQuery} from './generated/removeApprovedOrganizationDomainsQuery'

const removeApprovedOrganizationDomainsToPG = async (orgId: string, domains: string[]) => {
  return removeApprovedOrganizationDomainsQuery.run({orgId, domains} as any, getPg())
}
export default removeApprovedOrganizationDomainsToPG
