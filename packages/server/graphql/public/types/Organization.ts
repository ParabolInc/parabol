import getApprovedOrganizationDomainsFromPG from '../../../postgres/queries/getApprovedOrganizationDomainsFromPG'
import {isSuperUser} from '../../../utils/authorization'
import {OrganizationResolvers} from '../resolverTypes'

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}) => {
    // no need for a dataloader since it's infrequently used
    const currentApprovals = await getApprovedOrganizationDomainsFromPG(orgId)
    return currentApprovals.map((approval) => approval.domain)
  },
  company: async ({activeDomain}, _args, {authToken}) => {
    if (!activeDomain || !isSuperUser(authToken)) return null
    return {id: activeDomain}
  }
}

export default Organization
