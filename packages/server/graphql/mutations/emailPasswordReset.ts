import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import User from '../../database/types/User'
import rateLimit from '../rateLimit'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'
import {GQLContext} from '../graphql'
import {sendEmailContent} from '../../email/sendEmail'
import ms from 'ms'
import {Threshold} from 'parabol-client/types/constEnums'
import PasswordResetRequest from '../../database/types/PasswordResetRequest'
import crypto from 'crypto'
import promisify from 'es6-promisify'
import base64url from 'base64url'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import resetPasswordEmailCreator from '../../../client/modules/email/components/resetPasswordEmailCreator'

const randomBytes = promisify(crypto.randomBytes, crypto)

const emailPasswordReset = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: 'Send an email to reset a password',
  args: {
    email: {
      type: GraphQLNonNull(GraphQLID),
      description: 'email to send the password reset code to'
    }
  },
  resolve: rateLimit({perMinute: 5, perHour: 50})(async (_source, {email}, {ip}: GQLContext) => {
    const r = await getRethink()

    // we only wanna send like 2 emails/min or 5 per day to the same person
    const yesterday = Date.now() - ms('1d')
    const {user, failOnAccount, failOnTime} = await r({
      user: (r
        .table('User')
        .getAll(email, {index: 'email'})
        .nth(0)
        .default(null) as unknown) as User | null,
      failOnAccount: (r
        .table('PasswordResetRequest')
        .getAll([ip, email], {index: 'ipEmail'})
        .count()
        .ge(Threshold.MAX_ACCOUNT_DAILY_PASSWORD_RESETS) as unknown) as boolean,
      failOnTime: (r
        .table('PasswordResetRequest')
        .between([ip, yesterday], [ip, r.maxval], {index: 'ipTime'})
        .count()
        .ge(Threshold.MAX_DAILY_PASSWORD_RESETS) as unknown) as boolean
    }).run()

    if (failOnAccount || failOnTime || !user) return true
    const {id: userId, identities} = user
    const localIdentity = identities.find(
      (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
    ) as AuthIdentityLocal
    if (!localIdentity) return true

    // seems legit, make a record of it create a reset code
    const resetPasswordToken = base64url.encode(randomBytes(48))
    // invalidate all other tokens for this email
    await r
      .table('PasswordResetRequest')
      .getAll([r.maxval, email], {index: 'ipEmail'})
      .filter({isValid: true})
      .update({isValid: false})
      .run()
    await r
      .table('PasswordResetRequest')
      .insert(new PasswordResetRequest({ip, email, token: resetPasswordToken}))
      .run()

    // MUTATIVE
    localIdentity.resetPasswordToken = resetPasswordToken
    localIdentity.resetPasswordTokenExpiration = new Date(
      Date.now() + Threshold.RESET_PASSWORD_LIFESPAN
    )
    await r
      .table('User')
      .get(userId)
      .update({identities})
      .run()

    const emailContent = await resetPasswordEmailCreator({resetPasswordToken})
    try {
      await sendEmailContent([email], emailContent)
    } catch (e) {
      console.log(e)
    }
    return true
  })
}

export default emailPasswordReset
