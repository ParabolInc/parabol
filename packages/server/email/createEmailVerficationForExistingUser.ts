import base64url from 'base64url'
import crypto from 'crypto'
import getRethink from '../database/rethinkDriver'
import AuthIdentityLocal from '../database/types/AuthIdentityLocal'
import EmailVerification from '../database/types/EmailVerification'
import {DataLoaderWorker} from '../graphql/graphql'
import emailVerificationEmailCreator from './emailVerificationEmailCreator'
import getMailManager from './getMailManager'

const createEmailVerficationForExistingUser = async (
  userId: string,
  invitationToken: string,
  dataLoader: DataLoaderWorker
) => {
  const user = await dataLoader.get('users').loadNonNull(userId)
  const {email, segmentId, identities} = user
  // Typescript isn't discriminating on the type, manually casted
  const localIdentity = identities.find(
    (identity) => identity.type === 'LOCAL'
  ) as AuthIdentityLocal
  if (!localIdentity) return new Error('No local identity found')
  if (localIdentity.isEmailVerified) return new Error('Email already verified')
  const {hashedPassword} = localIdentity
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
    return new Error('Unable to send verification email')
  }
  const r = await getRethink()
  const emailVerification = new EmailVerification({
    email,
    token: verifiedEmailToken,
    hashedPassword,
    segmentId,
    invitationToken
  })
  await r.table('EmailVerification').insert(emailVerification).run()
  return undefined
}

export default createEmailVerficationForExistingUser
