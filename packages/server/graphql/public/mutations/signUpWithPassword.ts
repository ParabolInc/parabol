import bcrypt from 'bcryptjs'
import {AuthenticationError, Security} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import createEmailVerification from '../../../email/createEmailVerification'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import createNewLocalUser from '../../../utils/createNewLocalUser'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import isEmailVerificationRequired from '../../../utils/isEmailVerificationRequired'
import attemptLogin from '../../mutations/helpers/attemptLogin'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {MutationResolvers} from '../resolverTypes'

const signUpWithPassword: MutationResolvers['signUpWithPassword'] = async (
  _source,
  {invitationToken, password, segmentId, email: denormEmail},
  context
) => {
  const email = denormEmail.toLowerCase().trim()
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    return {error: {message: 'Email is too long'}}
  }
  const r = await getRethink()
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
  } else if (error === AuthenticationError.INVALID_PASSWORD) {
    return {error: {message: 'User already exists'}}
  }

  // it's a new user!
  const [nickname, domain] = email.split('@')
  if (!nickname || !domain) {
    return {error: {message: 'Invalid email'}}
  }
  const verificationRequired = await isEmailVerificationRequired(email, dataLoader)
  if (verificationRequired) {
    const existingVerification = await r
      .table('EmailVerification')
      .getAll(email, {index: 'email'})
      .filter((row: RValue) => row('expiration').gt(new Date()))
      .nth(0)
      .default(null)
      .run()
    if (existingVerification) {
      return {error: {message: 'Verification email already sent'}}
    }
    return createEmailVerification({invitationToken, password, segmentId, email})
  }
  const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
  const newUser = createNewLocalUser({email, hashedPassword, isEmailVerified: false, segmentId})
  // MUTATIVE
  context.authToken = await bootstrapNewUser(newUser, isOrganic)
  return {
    userId: newUser.id,
    authToken: encodeAuthToken(context.authToken),
    isNewUser: true
  }
}

export default signUpWithPassword
