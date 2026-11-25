import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import {AuthenticationError, Security} from 'parabol-client/types/constEnums'
import createEmailVerification from '../../../email/createEmailVerification'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {setAuthCookie} from '../../../utils/authCookie'
import createNewLocalUser from '../../../utils/createNewLocalUser'
import loadPasswordStrength from '../../../utils/loadPasswordStrength'
import normalizeEmail from '../../../utils/normalizeEmail'
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

const signUpWithPassword: MutationResolvers['signUpWithPassword'] = async (
  _source,
  {invitationToken, password, pseudoId, email: denormEmail, params},
  context
) => {
  const email = normalizeEmail(denormEmail)
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    throw new GraphQLError('Email is too long', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const pg = getKysely()
  const isOrganic = !invitationToken
  const {ip, dataLoader} = context
  const loginAttempt = await attemptLogin(email, password, ip, dataLoader)
  if (loginAttempt.userId) {
    context.authToken = loginAttempt.authToken
    setAuthCookie(context, context.authToken)
    return {
      userId: loginAttempt.userId,
      isNewUser: false
    }
  }
  const {error} = loginAttempt
  if (error === AuthenticationError.USER_EXISTS_GOOGLE) {
    throw new GraphQLError('Try logging in with Google', {
      extensions: {code: 'SIGN_IN_WITH_GOOGLE'}
    })
  }
  if (error === AuthenticationError.USER_EXISTS_MICROSOFT) {
    throw new GraphQLError('Try logging in with Microsoft', {
      extensions: {code: 'SIGN_IN_WITH_MICROSOFT'}
    })
  }
  if (error === AuthenticationError.INVALID_PASSWORD) {
    throw new GraphQLError('User already exists', {extensions: {code: 'CONFLICT'}})
  }

  // it's a new user!
  const [nickname, domain] = email.split('@')
  if (!nickname || !domain) {
    throw new GraphQLError('Invalid email', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const passwordStrength = await loadPasswordStrength()
  const weakError = passwordStrength(password, email)
  if (weakError) {
    throw new GraphQLError(weakError, {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const verifiedByInvite = await isValidEmailInvitationToken(email, invitationToken)
  if (!verifiedByInvite) {
    const existingVerification = await pg
      .selectFrom('EmailVerification')
      .selectAll()
      .where('email', '=', email)
      .where('expiration', '>', new Date())
      .executeTakeFirst()
    if (existingVerification) {
      throw new GraphQLError('Verification email already sent', {
        extensions: {code: 'EMAIL_VERIFICATION_REQUIRED'}
      })
    }
    const redirectTo = new URLSearchParams(params).get('redirectTo')
    const isSent = await createEmailVerification({
      invitationToken,
      password,
      pseudoId,
      email,
      redirectTo
    })
    if (!isSent) {
      throw new GraphQLError('Unable to send verification email', {
        extensions: {code: 'SERVICE_UNAVAILABLE'}
      })
    }
    throw new GraphQLError('Verification required. Check your inbox.', {
      extensions: {code: 'EMAIL_VERIFICATION_REQUIRED'}
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
  setAuthCookie(context, context.authToken)
  return {
    userId: newUser.id,
    isNewUser: true
  }
}

export default signUpWithPassword
