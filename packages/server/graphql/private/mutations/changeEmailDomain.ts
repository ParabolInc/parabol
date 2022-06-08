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

  // RESOLUTION
  const results = await r
    .table('Organization')
    .filter((row) => row('activeDomain').eq(oldDomain))
    .update({activeDomain: newDomain})
    .run()
  console.log('🚀  ~ results', results)

  const data = {}
  return data
}

export default changeEmailDomain
