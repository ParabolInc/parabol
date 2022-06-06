import removeApprovedOrganizationDomainsToPG from '../../../postgres/queries/removeApprovedOrganizationDomainsToPG'
import {MutationResolvers} from '../resolverTypes'

const removeApprovedOrganizationDomains: MutationResolvers['removeApprovedOrganizationDomains'] =
  async (_source, {emailDomains, orgId}) => {
    // VALIDATION
    const normalizedEmailDomains = emailDomains.map((domain) => domain.toLowerCase().trim())

    // RESOLUTION
    await removeApprovedOrganizationDomainsToPG(orgId, normalizedEmailDomains)
    const data = {orgId}
    return data
  }

export default removeApprovedOrganizationDomains
