import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const createImposterToken: MutationResolvers['createImposterToken'] = async (
  _source,
  {email, userId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  const user = userId
    ? await dataLoader.get('users').load(userId)
    : email
    ? await getUserByEmail(email)
    : null

  if (!user) {
    return standardError(new Error('User not found'), {userId: viewerId})
  }

  // RESOLUTION
  return {userId: user.id}
}

export default createImposterToken
