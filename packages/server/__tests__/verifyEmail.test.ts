import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {Threshold} from 'parabol-client/types/constEnums'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const VERIFY_EMAIL_MUTATION = `
  mutation VerifyEmailMutation($verificationToken: ID!) {
    verifyEmail(verificationToken: $verificationToken) {
      error {
        message
      }
      user {
        id
        email
      }
    }
  }
`

test('Verifying an email signs in an existing user who has only an OAuth identity', async () => {
  const {userId, email} = await signUp()
  const pg = getKysely()
  const oauthIdentities = [{id: crypto.randomUUID(), type: 'GOOGLE', isEmailVerified: true}]
  await pg
    .updateTable('User')
    .set({identities: oauthIdentities.map((identity) => JSON.stringify(identity))})
    .where('id', '=', userId)
    .execute()

  const verificationToken = crypto.randomBytes(48).toString('base64url')
  await pg
    .insertInto('EmailVerification')
    .values({
      email,
      token: verificationToken,
      hashedPassword: await bcrypt.hash(crypto.randomUUID(), 4),
      expiration: new Date(Date.now() + Threshold.EMAIL_VERIFICATION_LIFESPAN)
    })
    .execute()

  const verifyEmail = await sendPublic({
    query: VERIFY_EMAIL_MUTATION,
    variables: {verificationToken}
  })

  expect(verifyEmail).toMatchObject({
    cookie: expect.anything(),
    data: {
      verifyEmail: {
        error: null,
        user: {id: userId, email}
      }
    }
  })
  const user = await pg
    .selectFrom('User')
    .select('identities')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow()
  expect(user.identities).toEqual(oauthIdentities)
})
