import {r} from 'rethinkdb-ts'
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
  const [orgRes, teamMemberRes] = await Promise.all([
    r
      .table('Organization')
      .filter((row) => row('activeDomain').eq(normalizedOldDomain))
      .update({activeDomain: normalizedNewDomain})
      .run(),
    r
      .table('TeamMember')
      .filter((row) => r.expr(row('email')).split('@').nth(1).eq(normalizedOldDomain))
      .update((row) => ({email: row('email').split('@').nth(0).add(`@${normalizedNewDomain}`)}), {
        returnChanges: true
      })
      .run()
  ])
  console.log('🚀  ~ results', {orgRes, teamMemberRes})

  const data = {}
  return data
}

export default changeEmailDomain
