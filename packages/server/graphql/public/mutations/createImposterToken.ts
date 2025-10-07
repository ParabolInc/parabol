import ms from 'ms'
import AuthToken from '../../../database/types/AuthToken'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {setAuthCookie} from '../../../utils/authCookie'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const createImposterToken: MutationResolvers['createImposterToken'] = async (
  _source,
  {email, userId},
  context
) => {
  const {authToken, dataLoader} = context
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
  // For just graphql it would be sufficient to just give enough time to initalize the websocket connection
  // For pages though, each page opens a new websocket connection, so the token needs to be valid for longer
  setAuthCookie(context, new AuthToken({sub: user.id, tms: user.tms, rol: 'impersonate'}), ms('5m'))
  return {userId: user.id}
}

export default createImposterToken
