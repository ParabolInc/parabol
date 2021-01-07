import base64url from 'base64url'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import {Security} from 'parabol-client/types/constEnums'
import {ISignUpWithPasswordOnMutationArguments} from 'parabol-client/types/graphql'
import getRethink from '../database/rethinkDriver'
import EmailVerification from '../database/types/EmailVerification'
import emailVerificationEmailCreator from './emailVerificationEmailCreator'
import getMailManager from './getMailManager'

const createEmailVerification = async (props: ISignUpWithPasswordOnMutationArguments) => {
  const {password, invitationToken, segmentId} = props
  const email = props.email.toLowerCase()
  const tokenBuffer = crypto.randomBytes(48)
  const verifiedEmailToken = base64url.encode(tokenBuffer)
  const {subject, body, html} = emailVerificationEmailCreator({verifiedEmailToken, invitationToken})
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
