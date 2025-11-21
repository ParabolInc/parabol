import base64url from 'base64url'
import crypto from 'crypto'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import util from 'util'
import getMailManager from '../../../email/getMailManager'
import resetPasswordEmailCreator from '../../../email/resetPasswordEmailCreator'
import getKysely from '../../../postgres/getKysely'
import updateUser from '../../../postgres/queries/updateUser'
import type {UserAuthIdentity} from '../../../postgres/types'

const randomBytes = util.promisify(crypto.randomBytes)

const processEmailPasswordReset = async (
  ip: string,
  email: string,
  identities: UserAuthIdentity[],
  userId: string,
  sendEmail?: boolean | null
) => {
  const pg = getKysely()
  const tokenBuffer = await randomBytes(48)
  const resetPasswordToken = base64url.encode(tokenBuffer)
  // invalidate all other tokens for this email
  await pg
    .with('InvalidateOtherTokens', (qb) =>
      qb
        .updateTable('PasswordResetRequest')
        .set({isValid: false})
        .where('email', '=', email)
        .where('isValid', '=', true)
    )
    .insertInto('PasswordResetRequest')
    .values({
      ip,
      email,
      token: resetPasswordToken
    })
    .execute()

  await updateUser({identities: identities.map((id) => JSON.stringify(id))}, userId)

  if (sendEmail === false) return {success: true}

  const {subject, body, html} = resetPasswordEmailCreator({
    resetPasswordToken
  })
  const success = await getMailManager().sendEmail({
    to: email,
    subject,
    body,
    html,
    tags: ['type:resetPassword']
  })
  if (!success) return {error: {message: AuthenticationError.FAILED_TO_SEND}}
  return {success}
}

export default processEmailPasswordReset
