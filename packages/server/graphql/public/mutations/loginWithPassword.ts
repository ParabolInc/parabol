import {AuthenticationError} from 'parabol-client/types/constEnums'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import {MutationResolvers} from '../resolverTypes'
import attemptLogin from '../../mutations/helpers/attemptLogin'

const loginWithPassword: MutationResolvers['loginWithPassword'] = async (
  _source,
  {email, password},
  context
) => {
  if (process.env.AUTH_INTERNAL_DISABLED === 'true') {
    return {error: {message: 'Log in with password is disabled'}}
  }
  const loginAttempt = await attemptLogin(email, password, context.ip)
  if (loginAttempt.userId) {
    context.authToken = loginAttempt.authToken
    return {
      userId: loginAttempt.userId,
      authToken: encodeAuthToken(loginAttempt.authToken),
      isNewUser: false
    }
  }
  const {error} = loginAttempt
  if (error === AuthenticationError.USER_EXISTS_GOOGLE) {
    return {error: {message: 'Try logging in with Google'}}
  } else if (
    error === AuthenticationError.INVALID_PASSWORD ||
    error === AuthenticationError.USER_NOT_FOUND
  ) {
    return {error: {message: 'Invalid email or password'}}
  } else if (error === AuthenticationError.MISSING_HASH) {
    return {error: {message: error}}
  }
  return {error: {message: 'Unknown Error'}}
}

export default loginWithPassword
