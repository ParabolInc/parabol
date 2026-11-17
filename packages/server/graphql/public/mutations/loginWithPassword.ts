import {AuthenticationError} from 'parabol-client/types/constEnums'
import {logins} from '../../../metricsHandler'
import {setAuthCookie} from '../../../utils/authCookie'
import attemptLogin from '../../mutations/helpers/attemptLogin'
import type {MutationResolvers} from '../resolverTypes'
import userErrorResult from './helpers/userErrorResult'

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
    return userErrorResult('SIGN_IN_WITH_GOOGLE', 'Try logging in with Google')
  }
  if (error === AuthenticationError.USER_EXISTS_MICROSOFT) {
    return userErrorResult('SIGN_IN_WITH_MICROSOFT', 'Try logging in with Microsoft')
  }
  return userErrorResult('INVALID_CREDENTIALS', 'Invalid email or password')
}

export default loginWithPassword
