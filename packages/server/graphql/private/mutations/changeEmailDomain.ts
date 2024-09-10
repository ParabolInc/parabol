import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
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
  const pg = getKysely()

  const [updatedUserRes] = await Promise.all([
    pg
      .with('TeamMembersUpdate', (qc) =>
        qc
          .updateTable('TeamMember')
          .set({
            email: sql`CONCAT(LEFT(email, POSITION('@' in email)), ${normalizedNewDomain}::VARCHAR)`
          })
          .where('userId', 'in', userIdsToUpdate)
      )
      .with('OrganizationApprovedDomainUpdate', (qc) =>
        qc
          .updateTable('OrganizationApprovedDomain')
          .set({
            domain: sql`REPLACE("domain", ${normalizedOldDomain}, ${normalizedNewDomain})`
          })
          .where('domain', 'like', normalizedOldDomain)
      )
      .with('OrganizationUpdate', (qc) =>
        qc
          .updateTable('Organization')
          .set({activeDomain: normalizedNewDomain})
          .where('activeDomain', '=', normalizedOldDomain)
      )
      .with('SAMLUpdate', (qc) =>
        qc
          .updateTable('SAMLDomain')
          .set({domain: normalizedNewDomain})
          .where('domain', '=', normalizedOldDomain)
      )
      .updateTable('User')
      .set({
        email: sql`CONCAT(LEFT(email, POSITION('@' in email)), ${normalizedNewDomain}::VARCHAR)`
      })
      .where('id', 'in', userIdsToUpdate)
      .returning('id')
      .execute()
  ])

  const usersUpdatedIds = updatedUserRes.map(({id}) => id)
  const data = {usersUpdatedIds, usersNotUpdatedIds}
  return data
}

export default changeEmailDomain
