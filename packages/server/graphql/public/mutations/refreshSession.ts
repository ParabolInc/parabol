import {GraphQLError} from 'graphql'
import AuthToken from '../../../database/types/AuthToken'
import {setAuthCookie} from '../../../utils/authCookie'
import {blacklistJWTSession} from '../../../utils/blacklistJWT'
import {MutationResolvers} from '../resolverTypes'

const refreshSession: MutationResolvers['refreshSession'] = async (_source, {}, context) => {
  const {authToken, dataLoader} = context
  const {rol, sub, jti, exp, tms: tokenTeamIds} = authToken!

  if (rol === 'impersonate') {
    throw new GraphQLError('Cannot refresh an impersonation session', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  const user = await dataLoader.get('users').load(sub)
  if (!user) {
    throw new GraphQLError('User not found', {extensions: {code: 'NOT_FOUND'}})
  }

  const tms = await dataLoader.get('teamIdsByUserId').load(sub)
  // Tabs share one cookie, so a current token may be in use by the tab that just got it
  const isCurrent =
    rol === user.rol && new Set(tms).symmetricDifference(new Set(tokenTeamIds)).size === 0
  if (isCurrent) return true

  if (jti && exp) {
    await blacklistJWTSession(jti, exp, Date.now())
  }

  context.authToken = new AuthToken({sub, rol: user.rol, tms})
  setAuthCookie(context, context.authToken!)
  return true
}

export default refreshSession
