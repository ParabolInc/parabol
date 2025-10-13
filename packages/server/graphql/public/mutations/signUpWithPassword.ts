import bcrypt from 'bcryptjs'
import {AuthenticationError, Security} from 'parabol-client/types/constEnums'
import createEmailVerification from '../../../email/createEmailVerification'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import createNewLocalUser from '../../../utils/createNewLocalUser'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import attemptLogin from '../../mutations/helpers/attemptLogin'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import type {MutationResolvers} from '../resolverTypes'

const isValidEmailInvitationToken = async (
  email: string,
  inviteToken: string | undefined | null
) => {
  if (!inviteToken) return false
  const pg = getKysely()
  const invitation = await pg
    .selectFrom('TeamInvitation')
    .selectAll()
    .where('token', '=', inviteToken)
    .where('email', '=', email)
    .limit(1)
    .executeTakeFirst()
  if (!invitation) return false
  const {expiresAt} = invitation
  if (expiresAt.getTime() < Date.now()) return false
  return true
}

const isBlockedDomain = async (domain: string) => {
  const pg = getKysely()
  const blockedDomain = await pg
    .selectFrom('BlockedDomain')
    .selectAll()
    .where('domain', '=', domain)
    .limit(1)
    .executeTakeFirst()
  return !!blockedDomain
}

const signUpWithPassword: MutationResolvers['signUpWithPassword'] = async (
  _source,
  {invitationToken, password, pseudoId, email: denormEmail, params},
  context
) => {
  const email = denormEmail.toLowerCase().trim()
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    return {error: {message: 'Email is too long'}}
  }
  const pg = getKysely()
  const isOrganic = !invitationToken
  const {ip, dataLoader} = context
  const loginAttempt = await attemptLogin(email, password, ip)
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
  } else if (error === AuthenticationError.USER_EXISTS_MICROSOFT) {
    return {error: {message: 'Try logging in with Microsoft'}}
  } else if (error === AuthenticationError.INVALID_PASSWORD) {
    return {error: {message: 'User already exists'}}
  }

  // it's a new user!
  const [nickname, domain] = email.split('@')
  if (!nickname || !domain) {
    return {error: {message: 'Invalid email'}}
  }
  const [verifiedByInvite, domainBlocked] = await Promise.all([
    isValidEmailInvitationToken(email, invitationToken),
    isBlockedDomain(domain)
  ])
  if (domainBlocked) {
    return {
      error: {
        message: `You are using a temporary email provider or your provider was marked because it had suspicious activity.\nPlease contact love@parabol.co if you think this is a mistake.`
      }
    }
  }
  if (!verifiedByInvite) {
    const existingVerification = await pg
      .selectFrom('EmailVerification')
      .selectAll()
      .where('email', '=', email)
      .where('expiration', '>', new Date())
      .executeTakeFirst()
    if (existingVerification) {
      return {error: {message: 'Verification email already sent'}}
    }
    const redirectTo = new URLSearchParams(params).get('redirectTo')
    return createEmailVerification({
      invitationToken,
      password,
      pseudoId,
      email,
      redirectTo
    })
  }
  const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
  const newUser = await createNewLocalUser({
    email,
    hashedPassword,
    isEmailVerified: false,
    pseudoId
  })
  // MUTATIVE
  context.authToken = await bootstrapNewUser(newUser, isOrganic, dataLoader)
  return {
    userId: newUser.id,
    authToken: encodeAuthToken(context.authToken),
    isNewUser: true
  }
}

export default signUpWithPassword
