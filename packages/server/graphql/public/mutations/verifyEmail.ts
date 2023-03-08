import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import AuthToken from '../../../database/types/AuthToken'
import EmailVerification from '../../../database/types/EmailVerification'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import createNewLocalUser from '../../../utils/createNewLocalUser'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {MutationResolvers} from '../resolverTypes'

const verifyEmail: MutationResolvers['verifyEmail'] = async (
  _source,
  {verificationToken},
  context
) => {
  const r = await getRethink()
  const now = new Date()
  const emailVerification = (await r
    .table('EmailVerification')
    .getAll(verificationToken, {index: 'token'})
    .nth(0)
    .default(null)
    .run()) as EmailVerification

  if (!emailVerification) {
    return {error: {message: 'Invalid verification token'}}
  }

  const {email, expiration, hashedPassword, segmentId, invitationToken} = emailVerification
  if (expiration < now) {
    return {error: {message: 'Verification token expired'}}
  }

  const user = await getUserByEmail(email)

  if (user) {
    const {id: userId, identities, rol, tms} = user
    const localIdentity = identities.find(
      (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
    ) as AuthIdentityLocal
    context.authToken = new AuthToken({sub: userId, tms, rol})
    const authToken = encodeAuthToken(context.authToken)
    if (!localIdentity.isEmailVerified) {
      // mutative
      localIdentity.isEmailVerified = true
      await updateUser(
        {
          identities
        },
        userId
      )
    }
    return {authToken, userId, isNewUser: false}
  }
  if (!hashedPassword) {
    // should be impossible
    return {error: {message: 'Invalid hash for email. Please reverify'}}
  }
  // user does not exist, create them bootstrap
  const newUser = createNewLocalUser({email, hashedPassword, isEmailVerified: true, segmentId})
  // it's possible that the invitationToken is no good.
  // if that happens, then they'll get into the app & won't be on any team
  // edge case because that requires the invitation token to have expired
  const isOrganic = !invitationToken
  context.authToken = await bootstrapNewUser(newUser, isOrganic)
  return {
    userId: newUser.id,
    authToken: encodeAuthToken(context.authToken),
    isNewUser: true
  }
}

export default verifyEmail
