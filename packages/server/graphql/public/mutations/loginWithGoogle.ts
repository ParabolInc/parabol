import {GraphQLError} from 'graphql'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import AuthIdentityGoogle from '../../../database/types/AuthIdentityGoogle'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import {logins} from '../../../metricsHandler'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import {setAuthCookie} from '../../../utils/authCookie'
import GoogleServerManager from '../../../utils/GoogleServerManager'
import getSAMLURLFromEmail from '../../../utils/getSAMLURLFromEmail'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {generateIdenticon} from '../../private/mutations/helpers/generateIdenticon'
import type {MutationResolvers} from '../resolverTypes'
import userErrorResult from './helpers/userErrorResult'

const loginWithGoogle: MutationResolvers['loginWithGoogle'] = async (
  _source,
  {code, invitationToken, pseudoId},
  context
) => {
  const {dataLoader} = context
  const manager = await GoogleServerManager.init(code)
  const {id} = manager
  if (!id) {
    throw new GraphQLError('Invalid login code', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {picture, name, email_verified, sub} = id
  if (!id.email) {
    throw new GraphQLError('No email in Google token', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const email = id.email.toLowerCase()
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    return userErrorResult('EMAIL_INVALID', 'Email is too long')
  }

  const [existingUser, samlURL] = await Promise.all([
    getUserByEmail(email),
    getSAMLURLFromEmail(email, dataLoader, false)
  ])

  if (samlURL) {
    return userErrorResult(
      'SIGN_IN_WITH_SSO',
      'Your organization requires you to login with SSO. Reach out to support@parabol.co for more help!'
    )
  }
  if (existingUser) {
    const {id: viewerId, identities, rol} = existingUser
    let googleIdentity = identities.find(
      (identity) => identity.type === AuthIdentityTypeEnum.GOOGLE
    ) as AuthIdentityGoogle
    if (!googleIdentity) {
      const [bestIdentity] = identities

      if (bestIdentity) {
        const {type, isEmailVerified} = bestIdentity
        // the existing account could belong to a squatter. If it's theirs, they need to verify the email
        // if it's not, they need to reset the password
        if (!isEmailVerified) {
          if (type === AuthIdentityTypeEnum.LOCAL) {
            return userErrorResult(
              'SIGN_IN_WITH_PASSWORD',
              'Try logging in with email and password'
            )
          }
          throw new GraphQLError(`Unknown identity type: ${type}`, {
            extensions: {code: 'INTERNAL_SERVER_ERROR'}
          })
        }
      }
      // they don't have any identity, so a former SSO user, now abandoned, let them have their OAuth identity and move on

      // add a google identity to the user if we're sure the local isn't a squatter
      googleIdentity = new AuthIdentityGoogle({
        isEmailVerified: !!email_verified,
        id: sub
      })
      identities.push(googleIdentity) // mutative

      await updateUser({identities: identities.map((id) => JSON.stringify(id))}, viewerId)
    }
    // MUTATIVE
    const tms = await dataLoader.get('teamIdsByUserId').load(viewerId)
    context.authToken = new AuthToken({sub: viewerId, rol, tms})
    setAuthCookie(context, context.authToken)
    logins.inc({method: 'google'})
    return {
      userId: viewerId,
      isNewUser: false
    }
  }

  // it's a new user!
  const userId = `google-oauth2|${generateUID()}`
  const nickname = name || email.substring(0, email.indexOf('@'))
  const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
  const identity = new AuthIdentityGoogle({
    id: sub,
    isEmailVerified: !!email_verified
  })
  const newUser = new User({
    id: userId,
    preferredName,
    picture: picture || (await generateIdenticon(userId, preferredName)),
    email,
    identities: [identity],
    pseudoId
  })
  context.authToken = await bootstrapNewUser(newUser, !invitationToken, dataLoader)
  setAuthCookie(context, context.authToken)
  logins.inc({method: 'google'})
  return {
    userId,
    isNewUser: true
  }
}

export default loginWithGoogle
