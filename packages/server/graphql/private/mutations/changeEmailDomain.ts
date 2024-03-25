import {sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import {RDatum, RValue} from '../../../database/stricterR'
import getKysely from '../../../postgres/getKysely'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
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
  const pg = getKysely()

  const [updatedUserRes] = await Promise.all([
    updateUserEmailDomainsToPG(normalizedNewDomain, userIdsToUpdate),
    pg
      .updateTable('OrganizationApprovedDomain')
      .set({
        domain: sql`REPLACE("domain", ${normalizedOldDomain}, ${normalizedNewDomain})`
      })
      .where('domain', 'like', normalizedOldDomain)
      .execute(),
    r
      .table('Organization')
      .filter((row: RDatum) => row('activeDomain').eq(normalizedOldDomain))
      .update({activeDomain: normalizedNewDomain})
      .run(),
    r
      .table('TeamMember')
      .filter((row: RDatum) => row('email').match(`@${normalizedOldDomain}$`))
      .update((row: RDatum) => ({
        email: row('email').split('@').nth(0).add(`@${normalizedNewDomain}`)
      }))
      .run(),
    pg
      .updateTable('SAMLDomain')
      .set({domain: normalizedNewDomain})
      .where('domain', '=', normalizedOldDomain)
      .execute(),
    pg
      .updateTable('Invoice')
      .set({
        billingLeaderEmails: sql<string[]>`
        array(
          SELECT
            CASE
                WHEN strpos(email, '@') > 0 AND split_part(email, '@', 2) = '${normalizedOldDomain}' THEN
                    split_part(email, '@', 1) || '@${normalizedNewDomain}'
                ELSE
                    email
            END
          FROM unnest(billingLeaderEmails) AS t(email)
        )`
      })
      .where((eb) =>
        eb.exists(sql<boolean[]>`
        (
          SELECT 1
          FROM unnest(billingLeaderEmails) AS t(email)
          WHERE strpos(email, '@') > 0 AND split_part(email, '@', 2) = '${normalizedOldDomain}'
        )
      `)
      )
      .execute()
  ])

  const usersUpdatedIds = updatedUserRes.map(({id}) => id)
  const data = {usersUpdatedIds, usersNotUpdatedIds}
  return data
}

export default changeEmailDomain
