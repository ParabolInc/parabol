import base64url from 'base64url'
import crypto from 'crypto'
import emailVerificationEmailCreator from '../../client/modules/email/components/emailVerificationEmailCreator'
import {sendEmailContent} from '../email/sendEmail'
import {Security} from 'parabol-client/types/constEnums'
import bcrypt from 'bcrypt'
import EmailVerification from '../database/types/EmailVerification'
import getRethink from '../database/rethinkDriver'
import {ISignUpWithPasswordOnMutationArguments} from 'parabol-client/types/graphql'

const createEmailVerification = async (props: ISignUpWithPasswordOnMutationArguments) => {
  const {email, password, invitationToken, segmentId} = props
  const tokenBuffer = crypto.randomBytes(48)
  const verifiedEmailToken = base64url.encode(tokenBuffer)
  const emailContent = emailVerificationEmailCreator({verifiedEmailToken, invitationToken})
  try {
    await sendEmailContent([email], emailContent)
  } catch (e) {
    return {error: {message: 'Unable to send verification email'}}
  }
  const r = await getRethink()
  const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
  const emailVerification = new EmailVerification({
    email,
    token: verifiedEmailToken,
    hashedPassword,
    segmentId,
    invitationToken
  })
  await r
    .table('EmailVerification')
    .insert(emailVerification)
    .run()
  return {error: {message: 'Verification required. Check your inbox.'}}
}

export default createEmailVerification
