import {domainRegex, emailRegex} from 'parabol-client/validation/regex'
import insertApprovedOrganizationDomains from '../../../postgres/queries/insertApprovedOrganizationDomains'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const addApprovedOrganizationDomains: MutationResolvers['addApprovedOrganizationDomains'] = async (
  _source,
  {emailDomains, orgId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  const normalizedEmailDomains = emailDomains.map((domain) => domain.toLowerCase().trim())
  const invalidEmailDomain = normalizedEmailDomains.find((domain) => {
    if (!emailRegex.test(domain) && !domainRegex.test(domain)) return true
  })
  if (invalidEmailDomain) {
    return {error: {message: `${invalidEmailDomain} is not a valid domain or email`}}
  }

  // RESOLUTION
  await insertApprovedOrganizationDomains(orgId, viewerId, normalizedEmailDomains)
  const data = {orgId}
  return data
}

export default addApprovedOrganizationDomains
