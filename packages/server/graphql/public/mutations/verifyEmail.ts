import {GraphQLError} from 'graphql'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import type AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import AuthToken from '../../../database/types/AuthToken'
import {logins} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import {setAuthCookie} from '../../../utils/authCookie'
import createNewLocalUser from '../../../utils/createNewLocalUser'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import type {MutationResolvers} from '../resolverTypes'
import userErrorResult from './helpers/userErrorResult'

const verifyEmail: MutationResolvers['verifyEmail'] = async (
  _source,
  {verificationToken},
  context
) => {
  const {dataLoader} = context
  const pg = getKysely()
  const now = new Date()
  const emailVerification = await pg
    .deleteFrom('EmailVerification')
    .returningAll()
    .where('token', '=', verificationToken)
    .executeTakeFirst()

  if (!emailVerification) {
    return userErrorResult('TOKEN_INVALID', 'Invalid verification token')
  }

  const {email, expiration, hashedPassword, pseudoId, invitationToken} = emailVerification
  if (expiration < now) {
    return userErrorResult('TOKEN_EXPIRED', 'Verification token expired')
  }

  const user = await getUserByEmail(email)

  if (user) {
    const {id: userId, identities, rol, isRemoved} = user
    if (isRemoved) {
      return userErrorResult('ACCOUNT_REMOVED', 'This account has been removed')
    }
    const localIdentity = identities.find(
      (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
    ) as AuthIdentityLocal | undefined
    const tms = await dataLoader.get('teamIdsByUserId').load(userId)
    context.authToken = new AuthToken({sub: userId, tms, rol})
    setAuthCookie(context, context.authToken)
    if (localIdentity && !localIdentity.isEmailVerified) {
      // mutative
      localIdentity.isEmailVerified = true
      await updateUser({identities: identities.map((id) => JSON.stringify(id))}, userId)
    }
    logins.inc({method: 'password'})
    return {userId, isNewUser: false}
  }
  if (!hashedPassword) {
    throw new GraphQLError('Invalid hash for email. Please reverify', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }
  // user does not exist, create them bootstrap
  const newUser = await createNewLocalUser({
    email,
    hashedPassword,
    isEmailVerified: true,
    pseudoId
  })
  // it's possible that the invitationToken is no good.
  // if that happens, then they'll get into the app & won't be on any team
  // edge case because that requires the invitation token to have expired
  const isOrganic = !invitationToken
  context.authToken = await bootstrapNewUser(newUser, isOrganic, dataLoader)
  setAuthCookie(context, context.authToken)
  logins.inc({method: 'password'})
  return {
    userId: newUser.id,
    isNewUser: true
  }
}

export default verifyEmail
