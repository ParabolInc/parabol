import {domainRegex, emailRegex} from 'parabol-client/validation/regex'
import insertApprovedOrganizationDomains from '../../../postgres/queries/insertApprovedOrganizationDomains'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const addApprovedOrganizationDomains: MutationResolvers['addApprovedOrganizationDomains'] = async (
  _source,
  {domains, orgId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  const normalizedDomainsAndEmails = domains.map((domain) => domain.toLowerCase().trim())
  const invalidDomainOrEmail = normalizedDomainsAndEmails.find((domain) => {
    if (!emailRegex.test(domain) && !domainRegex.test(domain)) return true
  })
  if (invalidDomainOrEmail) {
    return {error: {message: `${invalidDomainOrEmail} is not a valid domain or email`}}
  }

  // RESOLUTION
  await insertApprovedOrganizationDomains(orgId, viewerId, normalizedDomainsAndEmails)
  const data = {orgId}
  return data
}

export default addApprovedOrganizationDomains
