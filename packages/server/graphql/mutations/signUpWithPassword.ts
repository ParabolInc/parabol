import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import SignUpWithPasswordPayload from '../types/SignUpWithPasswordPayload'
import User from '../../database/types/User'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import {AuthenticationError, Security} from 'parabol-client/types/constEnums'
import rateLimit from '../rateLimit'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'
import bootstrapNewUser from './helpers/bootstrapNewUser'
import attemptLogin from './helpers/attemptLogin'
import bcrypt from 'bcrypt'
import {GQLContext} from '../graphql'
import encodeAuthToken from '../../utils/encodeAuthToken'

const signUpWithPassword = {
  type: new GraphQLNonNull(SignUpWithPasswordPayload),
  description: 'Sign up using an email address and password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    },
    invitationToken: {
      type: GraphQLID,
      description: 'used to determine what suggested actions to create'
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(
    async (_source, {email, invitationToken, password, segmentId}, context: GQLContext) => {
      const isOrganic = !invitationToken
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
      } else if (error === AuthenticationError.INVALID_PASSWORD) {
        return {error: {message: 'User already exists'}}
      }

      // it's a new user!
      const nickname = email.substring(0, email.indexOf('@'))
      const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
      const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
      const newUser = new User({
        preferredName,
        email,
        identities: [],
        segmentId
      })
      const {id: userId} = newUser
      const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
      newUser.identities.push(new AuthIdentityLocal({hashedPassword, id: identityId}))
      // MUTATIVE
      context.authToken = await bootstrapNewUser(newUser, isOrganic, segmentId)
      return {
        userId,
        authToken: encodeAuthToken(context.authToken)
      }
    }
  )
}

export default signUpWithPassword
