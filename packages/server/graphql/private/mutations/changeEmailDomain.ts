import {r} from 'rethinkdb-ts'
import updateDomainsInOrganizationApprovedDomainToPG from '../../../postgres/queries/updateDomainsInOrganizationApprovedDomainToPG'
import updateUserEmailDomainsToPG from '../../../postgres/queries/updateUserEmailDomainsToPG'
import {MutationResolvers} from '../../private/resolverTypes'

const changeEmailDomain: MutationResolvers['changeEmailDomain'] = async (
  _source,
  {oldDomain, newDomain}
) => {
  // VALIDATION
  const normalizedNewDomain = newDomain.toLowerCase().trim()
  const normalizedOldDomain = oldDomain.toLowerCase().trim()
  if (oldDomain === newDomain) {
    throw new Error('New domain is the same as the old one')
  }

  // RESOLUTION
  const [updatedUserIds] = await Promise.all([
    updateUserEmailDomainsToPG(normalizedOldDomain, normalizedNewDomain),
    updateDomainsInOrganizationApprovedDomainToPG(normalizedOldDomain, normalizedNewDomain),
    r
      .table('Organization')
      .filter((row) => row('activeDomain').eq(normalizedOldDomain))
      .update({activeDomain: normalizedNewDomain})
      .run(),
    r
      .table('TeamMember')
      .filter((row) => row('email').match(`@${normalizedOldDomain}$`))
      .update((row) => ({email: row('email').split('@').nth(0).add(`@${normalizedNewDomain}`)}))
      .run(),
    r
      .table('SAML')
      .filter((row) => row('domains').contains(normalizedOldDomain))
      .update((row) => ({
        domains: row('domains').map((domain) =>
          r.branch(domain.eq(normalizedOldDomain), normalizedNewDomain, domain)
        )
      }))
      .run(),
    r
      .table('Invoice')
      .filter((row) =>
        row('billingLeaderEmails').contains((email) =>
          email.split('@').nth(1).eq(normalizedOldDomain)
        )
      )
      .update((row) => ({
        billingLeaderEmails: row('billingLeaderEmails').map((email) =>
          r.branch(
            email.split('@').nth(1).eq(normalizedOldDomain),
            email.split('@').nth(0).add(`@${normalizedNewDomain}`),
            email
          )
        )
      }))
      .run()
  ])

  const data = {userIds: updatedUserIds.map(({id}) => id)}
  return data
}

export default changeEmailDomain
