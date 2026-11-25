import {GraphQLError} from 'graphql'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import {logins} from '../../../metricsHandler'
import {setAuthCookie} from '../../../utils/authCookie'
import attemptLogin from '../../mutations/helpers/attemptLogin'
import type {MutationResolvers} from '../resolverTypes'

const loginWithPassword: MutationResolvers['loginWithPassword'] = async (
  _source,
  {email, password},
  context
) => {
  const {dataLoader, ip} = context
  const loginAttempt = await attemptLogin(email, password, ip, dataLoader)
  if (loginAttempt.userId) {
    context.authToken = loginAttempt.authToken
    setAuthCookie(context, loginAttempt.authToken)
    logins.inc({method: 'password'})
    return {
      userId: loginAttempt.userId,
      role: context.authToken.rol,
      isNewUser: false
    }
  }
  const {error} = loginAttempt
  if (error === AuthenticationError.USER_EXISTS_GOOGLE) {
    throw new GraphQLError('Try logging in with Google', {
      extensions: {code: 'SIGN_IN_WITH_GOOGLE'}
    })
  }
  if (error === AuthenticationError.USER_EXISTS_MICROSOFT) {
    throw new GraphQLError('Try logging in with Microsoft', {
      extensions: {code: 'SIGN_IN_WITH_MICROSOFT'}
    })
  }
  throw new GraphQLError('Invalid email or password', {extensions: {code: 'UNAUTHENTICATED'}})
}

export default loginWithPassword
