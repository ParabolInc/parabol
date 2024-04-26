import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import AuthIdentityMicrosoft from '../../../database/types/AuthIdentityMicrosoft'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import getSAMLURLFromEmail from '../../../utils/getSAMLURLFromEmail'
import MicrosoftServerManager from '../../../utils/MicrosoftServerManager'
import standardError from '../../../utils/standardError'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {generateIdenticon} from '../../private/mutations/helpers/generateIdenticon'
import {MutationResolvers} from '../resolverTypes'

const loginWithMicrosoft: MutationResolvers['loginWithMicrosoft'] = async (
  _source,
  {code, invitationToken, pseudoId},
  context
) => {
  const {dataLoader} = context
  const manager = await MicrosoftServerManager.init(code)
  const {id} = manager
  if (!id) {
    return standardError(new Error('Invalid login code'))
  }
  const {name, sub, tid} = id
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
          'Your organization requires you to login with SSO. Reach out to support@parabol.co for more help!'
      }
    }
  }
  if (existingUser) {
    const {id: viewerId, identities, rol} = existingUser
    let microsoftIdentity = identities.find(
      (identity): identity is AuthIdentityMicrosoft =>
        identity.type === AuthIdentityTypeEnum.MICROSOFT
    )
    if (!microsoftIdentity) {
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

      // add a microsoft identity to the user if we're sure the local isn't a squatter
      microsoftIdentity = new AuthIdentityMicrosoft({
        isEmailVerified: true,
        id: sub,
        tid
      })
      identities.push(microsoftIdentity) // mutative

      await updateUser({identities}, viewerId)
    }
    // MUTATIVE
    context.authToken = new AuthToken({sub: viewerId, rol, tms: existingUser.tms})
    return {
      userId: viewerId,
      // create a brand new auth token using the tms in our DB
      authToken: encodeAuthToken(context.authToken),
      isNewUser: false
    }
  }

  // it's a new user!
  const userId = `microsoft-oauth2|${generateUID()}`
  const nickname = name || email.substring(0, email.indexOf('@'))
  const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
  const identity = new AuthIdentityMicrosoft({
    id: sub,
    isEmailVerified: true,
    tid
  })
  const newUser = new User({
    id: userId,
    preferredName,
    picture: await generateIdenticon(userId, preferredName),
    email,
    identities: [identity],
    pseudoId
  })
  context.authToken = await bootstrapNewUser(newUser, !invitationToken, dataLoader)
  return {
    userId,
    authToken: encodeAuthToken(context.authToken),
    isNewUser: true
  }
}

export default loginWithMicrosoft
