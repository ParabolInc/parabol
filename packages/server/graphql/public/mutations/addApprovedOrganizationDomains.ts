import {GraphQLError} from 'graphql'
import {domainRegex, domainWithWildcardRegex, emailRegex} from 'parabol-client/validation/regex'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import normalizeDomain from '../../../utils/normalizeDomain'
import type {MutationResolvers} from '../resolverTypes'

const addApprovedOrganizationDomains: MutationResolvers['addApprovedOrganizationDomains'] = async (
  _source,
  {emailDomains, orgId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // VALIDATION
  if (emailDomains.length < 1) {
    throw new GraphQLError('Must include at least 1 email domain', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const normalizedEmailDomains = emailDomains.map(normalizeDomain)
  const invalidEmailDomain = normalizedEmailDomains.find(
    (domain) =>
      !emailRegex.test(domain) && !domainRegex.test(domain) && !domainWithWildcardRegex.test(domain)
  )
  if (invalidEmailDomain) {
    throw new GraphQLError(`${invalidEmailDomain} is not a valid domain or email`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
