import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import AuthIdentityGoogle from '../../../database/types/AuthIdentityGoogle'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import {setAuthCookie} from '../../../utils/authCookie'
import GoogleServerManager from '../../../utils/GoogleServerManager'
import getSAMLURLFromEmail from '../../../utils/getSAMLURLFromEmail'
import standardError from '../../../utils/standardError'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {generateIdenticon} from '../../private/mutations/helpers/generateIdenticon'
import type {MutationResolvers} from '../resolverTypes'

const loginWithGoogle: MutationResolvers['loginWithGoogle'] = async (
  _source,
  {code, invitationToken, pseudoId},
  context
) => {
  const {dataLoader} = context
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

  const [existingUser, samlURL] = await Promise.all([
    getUserByEmail(email),
    getSAMLURLFromEmail(email, dataLoader, false)
  ])

  if (samlURL) {
    return {
      error: {
        message:
          'our organization requires you to login with SSO. Reach out to support@parabol.co for more help!'
      }
    }
  }
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
          return {
            error: {message: 'Try logging in with email and password'}
          }
        }
        throw new Error(`Unknown identity type: ${type}`)
      }

      // add a google identity to the user if we're sure the local isn't a squatter
      googleIdentity = new AuthIdentityGoogle({
        isEmailVerified: email_verified !== 'false',
        id: sub
      })
      identities.push(googleIdentity) // mutative

      await updateUser({identities: identities.map((id) => JSON.stringify(id))}, viewerId)
    }
    // MUTATIVE
    context.authToken = new AuthToken({
      sub: viewerId,
      rol,
      tms: existingUser.tms
    })
    setAuthCookie(context, context.authToken)
    return {
      userId: viewerId,
      role: context.authToken.rol,
      isNewUser: false
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
    picture: picture || (await generateIdenticon(userId, preferredName)),
    email,
    identities: [identity],
    pseudoId
  })
  context.authToken = await bootstrapNewUser(newUser, !invitationToken, dataLoader)
  setAuthCookie(context, context.authToken)
  return {
    userId,
    role: context.authToken.rol,
    isNewUser: true
  }
}

export default loginWithGoogle
