import {unsetAuthCookie} from '../../../utils/authCookie'
import {blacklistJWTSession} from '../../../utils/blacklistJWT'
import {revalidateYjsConnections} from '../../../utils/tiptap/revalidateYjsConnections'
import {MutationResolvers} from '../resolverTypes'

const signOut: MutationResolvers['signOut'] = async (_source, {}, context) => {
  const {authToken} = context
  if (authToken?.jti && authToken?.exp) {
    await blacklistJWTSession(authToken.jti, authToken.exp)
    await revalidateYjsConnections({userIds: [authToken.sub]})
  }
  unsetAuthCookie(context)
  return true
}

export default signOut
