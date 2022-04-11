import {GraphQLID, GraphQLNonNull} from 'graphql'
import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import AuthIdentityGoogle from '../../database/types/AuthIdentityGoogle'
import AuthToken from '../../database/types/AuthToken'
import User from '../../database/types/User'
import generateUID from '../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../postgres/constants'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'
import updateUser from '../../postgres/queries/updateUser'
import encodeAuthToken from '../../utils/encodeAuthToken'
import GoogleServerManager from '../../utils/GoogleServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import LoginWithGooglePayload from '../types/LoginWithGooglePayload'
import bootstrapNewUser from './helpers/bootstrapNewUser'

const loginWithGoogle = {
  type: new GraphQLNonNull(LoginWithGooglePayload),
  description: 'Sign up or login using Google',
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The code provided from the OAuth2 flow'
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    },
    invitationToken: {
      type: GraphQLID,
      description: 'if present, the user is also joining a team'
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(
    async (
      _source: unknown,
      {
        code,
        invitationToken,
        segmentId
      }: {code: string; segmentId?: string | null; invitationToken?: string | null},
      context: GQLContext
    ) => {
      // VALIDATION
      if (process.env.AUTH_GOOGLE_DISABLED === 'true') {
        return {error: {message: 'Sign up or log in using Google is disabled'}}
      }
      const manager = await GoogleServerManager.init(code)
      const {id} = manager
      if (!id) {
        return standardError(new Error('Invalid login code'))
      }
      const {picture, name, email_verified, sub} = id
      const email = id.email.toLowerCase()
      if (email.length > USER_PREFERRED_NAME_LIMIT) {
        return {error: {message: 'Email is too long'}}
      }

      const existingUser = await getUserByEmail(email)

      if (existingUser) {
        const {id: viewerId, identities, rol} = existingUser
        let googleIdentity = identities.find(
          (identity) => identity.type === AuthIdentityTypeEnum.GOOGLE
        ) as AuthIdentityGoogle
        if (!googleIdentity) {
          const [bestIdentity] = identities
          if (!bestIdentity) {
            return standardError(new Error('No identity found! Please contact support'))
          }
          const {type, isEmailVerified} = bestIdentity
          // the existing account could belong to a squatter. If it's theirs, they need to verify the email
          // if it's not, they need to reset the password
          if (!isEmailVerified) {
            if (type === AuthIdentityTypeEnum.LOCAL) {
              return {error: {message: 'Try logging in with email and password'}}
            }
            throw new Error(`Unknown identity type: ${type}`)
          }

          // add a google identity to the user if we're sure the local isn't a squatter
          googleIdentity = new AuthIdentityGoogle({
            isEmailVerified: email_verified !== 'false',
            id: sub
          })
          identities.push(googleIdentity) // mutative

          await updateUser({identities}, viewerId)
        }
        // MUTATIVE
        context.authToken = new AuthToken({sub: viewerId, rol, tms: existingUser.tms})
        return {
          userId: viewerId,
          // create a brand new auth token using the tms in our DB
          authToken: encodeAuthToken(context.authToken)
        }
      }

      // it's a new user!
      const userId = `google-oauth2|${generateUID()}`
      const nickname = name || email.substring(0, email.indexOf('@'))
      const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
      const identity = new AuthIdentityGoogle({
        id: sub,
        isEmailVerified: email_verified !== 'false'
      })
      const newUser = new User({
        id: userId,
        preferredName,
        picture,
        email,
        identities: [identity],
        segmentId
      })
      context.authToken = await bootstrapNewUser(newUser, !invitationToken)
      return {
        userId,
        authToken: encodeAuthToken(context.authToken)
      }
    }
  )
}

export default loginWithGoogle
