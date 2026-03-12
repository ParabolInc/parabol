import {unsetAuthCookie} from '../../../utils/authCookie'
import {blacklistJWTSession} from '../../../utils/blacklistJWT'
import {MutationResolvers} from '../resolverTypes'

const signOut: MutationResolvers['signOut'] = async (_source, {}, context) => {
  const {authToken} = context
  if (authToken?.jti && authToken?.iat) {
    await blacklistJWTSession(authToken.jti, authToken.iat)
  }
  unsetAuthCookie(context)
  // TODO disconnect all sockets
  return true
}

export default signOut
