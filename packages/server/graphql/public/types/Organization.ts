import getApprovedOrganizationDomainsFromPG from '../../../postgres/queries/getApprovedOrganizationDomainsFromPG'
import {OrganizationResolvers} from '../resolverTypes'

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}) => {
    // no need for a dataloader since it's infrequently used
    const currentApprovals = await getApprovedOrganizationDomainsFromPG(orgId)
    return currentApprovals.map((approval) => approval.domain)
  }
}

export default Organization
