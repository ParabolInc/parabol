import base64url from 'base64url'
import crypto from 'crypto'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import {r} from 'rethinkdb-ts'
import util from 'util'
import AuthIdentity from '../../../database/types/AuthIdentity'
import PasswordResetRequest from '../../../database/types/PasswordResetRequest'
import getMailManager from '../../../email/getMailManager'
import resetPasswordEmailCreator from '../../../email/resetPasswordEmailCreator'
import updateUser from '../../../postgres/queries/updateUser'

const randomBytes = util.promisify(crypto.randomBytes)

const processEmailPasswordReset = async (
  ip: string,
  email: string,
  identities: AuthIdentity[],
  userId: string
) => {
  const tokenBuffer = await randomBytes(48)
  const resetPasswordToken = base64url.encode(tokenBuffer)
  // invalidate all other tokens for this email
  await r
    .table('PasswordResetRequest')
    .getAll(email, {index: 'email'})
    .filter({isValid: true})
    .update({isValid: false})
    .run()
  await r
    .table('PasswordResetRequest')
    .insert(new PasswordResetRequest({ip, email, token: resetPasswordToken}))
    .run()

  await updateUser({identities}, userId)

  const {subject, body, html} = resetPasswordEmailCreator({resetPasswordToken})
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
