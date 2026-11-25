import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import ms from 'ms'
import {Security, Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import getSSODomainFromEmail from '../../../../client/utils/getSSODomainFromEmail'
// TODO: AuthIdentityLocal is from the deprecated /database directory — replace when postgres type exists
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import generateRandomString from '../../../generateRandomString'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import normalizeEmail from '../../../utils/normalizeEmail'
import processEmailPasswordReset from '../../mutations/helpers/processEmailPasswordReset'
import type {MutationResolvers} from '../resolverTypes'

const emailPasswordReset: MutationResolvers['emailPasswordReset'] = async (
  _source,
  {email: denormEmail},
  {ip, dataLoader}
) => {
  if (process.env.AUTH_INTERNAL_DISABLED === 'true') {
    throw new GraphQLError('Resetting password is disabled', {
      extensions: {code: 'NOT_IMPLEMENTED'}
    })
  }
  const email = normalizeEmail(denormEmail)

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
    throw new GraphQLError('Too many reset password attempts. Please try again later.', {
      extensions: {code: 'TOO_MANY_REQUESTS'}
    })
  }
  const domain = getSSODomainFromEmail(email)
  const saml = domain ? await dataLoader.get('samlByDomain').load(domain) : null
  const samlDomainExists = !!saml?.metadata

  if (samlDomainExists) {
    throw new GraphQLError('Your organization requires you to login with SSO', {
      extensions: {code: 'SIGN_IN_WITH_SSO'}
    })
  }
  if (!user) {
    throw new GraphQLError('We couldn’t find that email. Please try again.', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  const {id: userId, identities} = user

  const googleIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.GOOGLE
  )
  if (googleIdentity) {
    throw new GraphQLError('Try logging in with Google', {
      extensions: {code: 'SIGN_IN_WITH_GOOGLE'}
    })
  }

  const microsoftIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.MICROSOFT
  )
  if (microsoftIdentity) {
    throw new GraphQLError('Try logging in with Microsoft', {
      extensions: {code: 'SIGN_IN_WITH_MICROSOFT'}
    })
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
    identities.push(newIdentity)
  }
  const res = await processEmailPasswordReset(ip, email, identities, userId)
  if ('error' in res) {
    throw new GraphQLError('Unable to send the password reset email', {
      extensions: {code: 'SERVICE_UNAVAILABLE'}
    })
  }
  return {success: true, userErrors: []}
}

export default emailPasswordReset
