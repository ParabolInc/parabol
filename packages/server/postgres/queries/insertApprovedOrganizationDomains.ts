import getPg from '../getPg'
import {insertApprovedOrganizationDomainsQuery} from './generated/insertApprovedOrganizationDomainsQuery'

const insertApprovedOrganizationDomains = async (
  orgId: string,
  userId: string,
  domains: string[]
) => {
  if (domains.length === 0) return
  const approvals = domains.map((domain) => ({
    addedByUserId: userId,
    orgId,
    domain
  }))
  insertApprovedOrganizationDomainsQuery.run({approvals}, getPg())
}

export default insertApprovedOrganizationDomains
