import updateDomainsInOrganizationApprovedDomainToPG from '../../../postgres/queries/updateDomainsInOrganizationApprovedDomainToPG'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../../public/resolverTypes'

const changeEmailDomain: MutationResolvers['changeEmailDomain'] = async (
  _source,
  {oldDomain, newDomain},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()

  // VALIDATION
  if (oldDomain === newDomain) {
    throw new Error('New domain is the same as the old one')
  }
  const normalizedNewDomain = newDomain.toLowerCase()
  const normalizedOldDomain = oldDomain.toLowerCase()

  // RESOLUTION
  // const [orgRes, teamMemberRes, samlRes, invoiceRes] = await Promise.all([
  //   r
  //     .table('Organization')
  //     .filter((row) => row('activeDomain').eq(normalizedOldDomain))
  //     .update({activeDomain: normalizedNewDomain})
  //     .run(),
  //   r
  //     .table('TeamMember')
  //     .filter((row) => r.expr(row('email')).split('@').nth(1).eq(normalizedOldDomain))
  //     .update((row) => ({email: row('email').split('@').nth(0).add(`@${normalizedNewDomain}`)}), {
  //       returnChanges: true
  //     })
  //     .run(),
  //   r
  //     .table('SAML')
  //     .filter((row) => row('domains').contains(normalizedOldDomain))
  //     .update(
  //       (row) => ({
  //         domains: row('domains').map((domain) =>
  //           r.branch(domain.eq(normalizedOldDomain), normalizedNewDomain, domain)
  //         )
  //       }),
  //       {returnChanges: true}
  //     )
  //     .run(),
  //   r
  //     .table('Invoice')
  //     .filter((row) =>
  //       row('billingLeaderEmails').contains((email) =>
  //         email.split('@').nth(1).eq(normalizedOldDomain)
  //       )
  //     )
  //     .update(
  //       (row) => ({
  //         billingLeaderEmails: row('billingLeaderEmails').map((email) =>
  //           r.branch(
  //             email.split('@').nth(1).eq(normalizedOldDomain),
  //             email.split('@').nth(0).add(`@${normalizedNewDomain}`),
  //             email
  //           )
  //         )
  //       }),
  //       {returnChanges: true}
  //     )
  //     .run()
  // ])
  // console.log('🚀  ~ results', {orgRes, teamMemberRes, samlRes, invoiceRes})

  await updateDomainsInOrganizationApprovedDomainToPG(normalizedOldDomain, normalizedNewDomain)

  const data = {}
  return data
}

export default changeEmailDomain
