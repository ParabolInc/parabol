import base64url from 'base64url'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {Security, Threshold} from 'parabol-client/types/constEnums'
import getKysely from '../postgres/getKysely'
import emailVerificationEmailCreator from './emailVerificationEmailCreator'
import getMailManager from './getMailManager'

type SignUpWithPasswordMutationVariables = {
  email: string
  password: string
  invitationToken?: string | null
  pseudoId?: string | null
  redirectTo?: string | null
}

const createEmailVerification = async (props: SignUpWithPasswordMutationVariables) => {
  const {password, invitationToken, pseudoId, redirectTo} = props
  const email = props.email.toLowerCase().trim()
  const tokenBuffer = crypto.randomBytes(48)
  const verifiedEmailToken = base64url.encode(tokenBuffer)
  const {subject, body, html} = emailVerificationEmailCreator({
    verifiedEmailToken,
    invitationToken,
    redirectTo
  })
  const success = await getMailManager().sendEmail({
    to: email,
    subject,
    body,
    html,
    tags: ['type:emailVerification']
  })
  if (!success) {
    return {error: {message: 'Unable to send verification email'}}
  }
  const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
  const pg = getKysely()
  await pg
    .insertInto('EmailVerification')
    .values({
      email,
      token: verifiedEmailToken,
      hashedPassword,
      pseudoId,
      invitationToken,
      expiration: new Date(Date.now() + Threshold.EMAIL_VERIFICATION_LIFESPAN)
    })
    .execute()
  return {error: {message: 'Verification required. Check your inbox.'}}
}

export default createEmailVerification
