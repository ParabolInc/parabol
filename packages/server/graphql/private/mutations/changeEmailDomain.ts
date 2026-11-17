import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
import normalizeDomain from '../../../utils/normalizeDomain'
import type {MutationResolvers} from '../../private/resolverTypes'

const changeEmailDomain: MutationResolvers['changeEmailDomain'] = async (
  _source,
  {oldDomain, newDomain}
) => {
  // VALIDATION
  const normalizedNewDomain = normalizeDomain(newDomain)
  const normalizedOldDomain = normalizeDomain(oldDomain)
  if (normalizedOldDomain === normalizedNewDomain) {
    throw new GraphQLError('New domain is the same as the old one', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  if (normalizedOldDomain.includes('@') || normalizedNewDomain.includes('@')) {
    throw new GraphQLError('Domains should include everything after the @', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const [oldDomainUsers, newDomainUsers] = await Promise.all([
    getUsersbyDomain(normalizedOldDomain),
    getUsersbyDomain(normalizedNewDomain)
  ])

  if (!oldDomainUsers.length) {
    throw new GraphQLError(`No users found with oldDomain: ${oldDomain}`, {
      extensions: {code: 'NOT_FOUND'}
    })
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

  await pg
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
    .updateTable('SAMLDomain')
    .set({domain: normalizedNewDomain})
    .where('domain', '=', normalizedOldDomain)
    .execute()

  if (userIdsToUpdate.length === 0) {
    return {usersUpdatedIds: [], usersNotUpdatedIds}
  }

  const updatedUserRes = await pg
    .updateTable('User')
    .set({
      email: sql`CONCAT(LEFT(email, POSITION('@' in email)), ${normalizedNewDomain}::VARCHAR)`
    })
    .where('id', 'in', userIdsToUpdate)
    .returning('id')
    .execute()
  const usersUpdatedIds = updatedUserRes.map(({id}) => id)
  const data = {usersUpdatedIds, usersNotUpdatedIds}
  return data
}

export default changeEmailDomain
