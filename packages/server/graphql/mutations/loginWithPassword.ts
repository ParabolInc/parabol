import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import LoginWithPasswordPayload from '../types/LoginWithPasswordPayload'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import rateLimit from '../rateLimit'
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
  resolve: rateLimit({perMinute: 50, perHour: 500})(async (_source, {email, password}) => {
    const loginAttempt = await attemptLogin(email, password)
    if (loginAttempt.userId) {
      return loginAttempt
    }
    const {error} = loginAttempt
    if (error === AuthenticationError.USER_EXISTS_GOOGLE) {
      return {error: 'Try logging in with Google'}
    } else if (
      error === AuthenticationError.INVALID_PASSWORD ||
      error === AuthenticationError.USER_NOT_FOUND
    ) {
      return {error: 'Invalid email or password'}
    }
  })
}

export default loginWithPassword
