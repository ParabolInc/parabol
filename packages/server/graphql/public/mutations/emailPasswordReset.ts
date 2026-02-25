import bcrypt from 'bcryptjs'
import ms from 'ms'
import {AuthenticationError, Security, Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import getSSODomainFromEmail from '../../../../client/utils/getSSODomainFromEmail'
// TODO: AuthIdentityLocal is from the deprecated /database directory — replace when postgres type exists
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import generateRandomString from '../../../generateRandomString'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import processEmailPasswordReset from '../../mutations/helpers/processEmailPasswordReset'
import type {MutationResolvers} from '../resolverTypes'

const emailPasswordReset: MutationResolvers['emailPasswordReset'] = async (
  _source,
  {email: denormEmail},
  {ip, dataLoader}
) => {
  if (process.env.AUTH_INTERNAL_DISABLED === 'true') {
    return {error: {message: 'Resetting password is disabled'}}
  }
  const email = denormEmail.toLowerCase().trim()

  const yesterday = new Date(Date.now() - ms('1d'))
  const user = await getUserByEmail(email)
  const pg = getKysely()
  const [failOnAccount, failOnTime] = await Promise.all([
    pg
      .selectFrom('PasswordResetRequest')
      .where('ip', '=', ip)
      .where('email', '=', email)
      .where('time', '>=', yesterday)
      .select(({eb, fn}) =>
        eb(fn.count('id'), '>=', Threshold.MAX_ACCOUNT_DAILY_PASSWORD_RESETS).as('res')
      )
      .executeTakeFirstOrThrow(),
    pg
      .selectFrom('PasswordResetRequest')
      .where('ip', '=', ip)
      .where('time', '>=', yesterday)
      .select(({eb, fn}) => eb(fn.count('id'), '>=', Threshold.MAX_DAILY_PASSWORD_RESETS).as('res'))
      .executeTakeFirstOrThrow()
  ])
  if (failOnAccount.res || failOnTime.res) {
    return {error: {message: AuthenticationError.EXCEEDED_RESET_THRESHOLD}}
  }
  const domain = getSSODomainFromEmail(email)
  const saml = domain ? await dataLoader.get('samlByDomain').load(domain) : null
  const samlDomainExists = !!saml?.metadata

  if (samlDomainExists) return {error: {message: AuthenticationError.USER_EXISTS_SAML}}
  if (!user) return {error: {message: AuthenticationError.USER_NOT_FOUND}}
  const {id: userId, identities} = user

  const googleIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.GOOGLE
  )
  if (googleIdentity) {
    return {error: {message: AuthenticationError.USER_EXISTS_GOOGLE}}
  }

  const microsoftIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.MICROSOFT
  )
  if (microsoftIdentity) {
    return {error: {message: AuthenticationError.USER_EXISTS_MICROSOFT}}
  }

  const localIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
  ) as AuthIdentityLocal
  if (!localIdentity) {
    const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
    const dummyPassword = generateRandomString(Security.SALT_ROUNDS)
    const dummyHashedPassword = await bcrypt.hash(dummyPassword, Security.SALT_ROUNDS)
    const newIdentity = new AuthIdentityLocal({
      hashedPassword: dummyHashedPassword,
      id: identityId,
      isEmailVerified: false
    })
    const newIdentities = [...identities, newIdentity]
    return await processEmailPasswordReset(ip, email, newIdentities, userId)
  }
  return await processEmailPasswordReset(ip, email, identities, userId)
}

export default emailPasswordReset
