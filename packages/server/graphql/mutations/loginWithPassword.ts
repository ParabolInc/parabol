import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import encodeAuthToken from '../../utils/encodeAuthToken'
import rateLimit from '../rateLimit'
import LoginWithPasswordPayload from '../types/LoginWithPasswordPayload'
import attemptLogin from './helpers/attemptLogin'

const loginWithPassword = {
  type: new GraphQLNonNull(LoginWithPasswordPayload),
  description: 'Login using an email address and password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(
    async (_source: unknown, {email, password}: {email: string; password: string}, context) => {
      if (process.env.AUTH_INTERNAL_DISABLED === 'true') {
        return {error: {message: 'Log in with password is disabled'}}
      }
      const loginAttempt = await attemptLogin(email, password, context.ip)
      if (loginAttempt.userId) {
        context.authToken = loginAttempt.authToken
        return {
          userId: loginAttempt.userId,
          authToken: encodeAuthToken(loginAttempt.authToken)
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
  )
}

export default loginWithPassword
