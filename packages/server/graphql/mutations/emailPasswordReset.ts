import {GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {AuthenticationError, Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import getSSODomainFromEmail from '../../../client/utils/getSSODomainFromEmail'
import getRethink from '../../database/rethinkDriver'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import EmailPassWordResetPayload from '../types/EmailPasswordResetPayload'
import processEmailPasswordReset from './helpers/processEmailPasswordReset'

const emailPasswordReset = {
  type: new GraphQLNonNull(EmailPassWordResetPayload),
  description: 'Send an email to reset a password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'email to send the password reset code to'
    }
  },
  resolve: rateLimit({perMinute: 5, perHour: 50})(
    async (_source: unknown, {email: denormEmail}: {email: string}, {ip}: GQLContext) => {
      if (process.env.AUTH_INTERNAL_DISABLED === 'true') {
        return {error: {message: 'Resetting password is disabled'}}
      }
      const email = denormEmail.toLowerCase().trim()
      const r = await getRethink()

      // we only wanna send like 2 emails/min or 5 per day to the same person
      const yesterday = new Date(Date.now() - ms('1d'))
      const user = await getUserByEmail(email)
      const {failOnAccount, failOnTime} = await r({
        failOnAccount: r
          .table('PasswordResetRequest')
          .getAll(ip, {index: 'ip'})
          .filter({email})
          .count()
          .ge(Threshold.MAX_ACCOUNT_DAILY_PASSWORD_RESETS) as unknown as boolean,
        failOnTime: r
          .table('PasswordResetRequest')
          .getAll(ip, {index: 'ip'})
          .filter((row) => row('time').ge(yesterday))
          .count()
          .ge(Threshold.MAX_DAILY_PASSWORD_RESETS) as unknown as boolean
      }).run()
      if (failOnAccount || failOnTime) {
        return {error: {message: AuthenticationError.EXCEEDED_RESET_THRESHOLD}}
      }
      const domain = getSSODomainFromEmail(email)
      const samlDomainExists = await r
        .table('SAML')
        .filter((row) => row('domains').contains(domain))
        .run()
      if (samlDomainExists.length) return {error: {message: AuthenticationError.USER_EXISTS_SAML}}
      if (!user) return {error: {message: AuthenticationError.USER_NOT_FOUND}}
      const {id: userId, identities} = user
      const googleIdentity = identities.find(
        (identity) => identity.type === AuthIdentityTypeEnum.GOOGLE
      )
      if (googleIdentity) return {error: {message: AuthenticationError.USER_EXISTS_GOOGLE}}
      const localIdentity = identities.find(
        (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
      ) as AuthIdentityLocal
      if (!localIdentity) return {error: {message: AuthenticationError.IDENTITY_NOT_FOUND}}
      // seems legit, make a record of it create a reset code
      return await processEmailPasswordReset(ip, email, identities, userId)
    }
  )
}

export default emailPasswordReset
