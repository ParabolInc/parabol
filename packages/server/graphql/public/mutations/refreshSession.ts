import {GraphQLError} from 'graphql'
import AuthToken from '../../../database/types/AuthToken'
import {setAuthCookie} from '../../../utils/authCookie'
import {blacklistJWTSession} from '../../../utils/blacklistJWT'
import {MutationResolvers} from '../resolverTypes'

const refreshSession: MutationResolvers['refreshSession'] = async (_source, {}, context) => {
  const {authToken, dataLoader} = context
  const {rol, sub, jti, exp} = authToken!

  if (rol === 'impersonate') {
    throw new GraphQLError('Cannot refresh an impersonation session')
  }

  const user = await dataLoader.get('users').load(sub)
  if (!user) {
    throw new GraphQLError('User not found')
  }

  if (jti && exp) {
    await blacklistJWTSession(jti, exp)
  }

  context.authToken = new AuthToken({
    sub,
    rol: user.rol
  })
  setAuthCookie(context, context.authToken!)
  return true
}

export default refreshSession
