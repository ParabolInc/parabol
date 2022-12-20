import {r} from 'rethinkdb-ts'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
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
  if (normalizedOldDomain === normalizedNewDomain) {
    return {error: {message: 'New domain is the same as the old one'}}
  }

  if (normalizedOldDomain.includes('@') || normalizedNewDomain.includes('@')) {
    return {error: {message: 'Domains should include everything after the @'}}
  }

  const [oldDomainUsers, newDomainUsers] = await Promise.all([
    getUsersbyDomain(normalizedOldDomain),
    getUsersbyDomain(normalizedNewDomain)
  ])

  if (!oldDomainUsers.length) {
    return {error: {message: `No users found with oldDomain: ${oldDomain}`}}
  }

  const newDomainUserEmails = newDomainUsers.map(({email}) => email)
  const usersNotUpdatedIds = oldDomainUsers
    .filter(({email}) => {
      const emailUsername = email.split('@')[0]
      const proposedNewEmail = `${emailUsername}@${newDomain}`
      return newDomainUserEmails.includes(proposedNewEmail)
    })
    .map(({id}) => id)

  const userIdsToUpdate = oldDomainUsers
    .filter(({id}) => !usersNotUpdatedIds.includes(id))
    .map(({id}) => id)

  // RESOLUTION
  const [updatedUserRes] = await Promise.all([
    updateUserEmailDomainsToPG(normalizedNewDomain, userIdsToUpdate),
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

  const usersUpdatedIds = updatedUserRes.map(({id}) => id)
  const data = {usersUpdatedIds, usersNotUpdatedIds}
  return data
}

export default changeEmailDomain
