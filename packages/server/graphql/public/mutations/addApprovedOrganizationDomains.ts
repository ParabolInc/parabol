import {domainRegex, domainWithWildcardRegex, emailRegex} from 'parabol-client/validation/regex'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const addApprovedOrganizationDomains: MutationResolvers['addApprovedOrganizationDomains'] = async (
  _source,
  {emailDomains, orgId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // VALIDATION
  if (emailDomains.length < 1) {
    return {error: {message: 'Must include at least 1 email domain'}}
  }

  const normalizedEmailDomains = emailDomains.map((domain) => domain.toLowerCase().trim())
  const invalidEmailDomain = normalizedEmailDomains.find(
    (domain) =>
      !emailRegex.test(domain) && !domainRegex.test(domain) && !domainWithWildcardRegex.test(domain)
  )
  if (invalidEmailDomain) {
    return {error: {message: `${invalidEmailDomain} is not a valid domain or email`}}
  }

  // RESOLUTION
  const approvals = normalizedEmailDomains.map((domain) => ({
    addedByUserId: viewerId,
    orgId,
    domain
  }))

  await pg
    .insertInto('OrganizationApprovedDomain')
    .values(approvals)
    .onConflict((oc) => oc.doNothing())
    .execute()

  const data = {orgId}
  return data
}

export default addApprovedOrganizationDomains
