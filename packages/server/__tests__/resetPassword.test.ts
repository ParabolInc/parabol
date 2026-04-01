import base64url from 'base64url'
import crypto from 'crypto'
import faker from 'faker'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

test('Reset password', async () => {
  const {email, cookie} = await signUp()

  // Generate a reset token and store its SHA-256 hash in the DB directly
  const tokenBuffer = crypto.randomBytes(48)
  const resetPasswordToken = base64url.encode(tokenBuffer)
  const tokenHash = crypto.createHash('sha256').update(resetPasswordToken).digest('hex')

  const pg = getKysely()
  await pg
    .insertInto('PasswordResetRequest')
    .values({
      ip: '127.0.0.1',
      email,
      tokenHash
    })
    .execute()

  const newPassword = faker.internet.password(20)

  const result = await sendPublic({
    query: `
      mutation ResetPassword($token: ID!, $newPassword: String!) {
        resetPassword(token: $token, newPassword: $newPassword) {
          error {
            message
          }
          userId
        }
      }
    `,
    variables: {
      token: resetPasswordToken,
      newPassword
    },
    cookie
  })

  expect(result).toMatchObject({
    cookie: expect.anything(),
    data: {
      resetPassword: {
        error: null,
        userId: expect.anything()
      }
    }
  })

  // Verify login with new password works
  const login = await sendPublic({
    query: `
      mutation LoginWithPassword($email: ID!, $password: String!) {
        loginWithPassword(email: $email, password: $password) {
          error {
            message
          }
          user {
            id
            email
          }
        }
      }
    `,
    variables: {email, password: newPassword}
  })

  expect(login).toMatchObject({
    data: {
      loginWithPassword: {
        error: null,
        user: {
          email
        }
      }
    }
  })
})
