import {getTestEmail, sendIntranet, signUp} from './common'

const EMAIL_PASSWORD_RESET = `
  mutation EmailPasswordReset($email: ID!) {
    emailPasswordReset(email: $email) {
      success
    }
  }
`

test('Email password reset', async () => {
  const {email} = await signUp()

  const passwordReset = await sendIntranet({
    query: EMAIL_PASSWORD_RESET,
    variables: {
      email
    }
  })

  expect(passwordReset).toMatchObject({
    data: {
      emailPasswordReset: {
        success: true
      }
    }
  })
})

test('Email password reset for an unknown email fails with NOT_FOUND', async () => {
  const passwordReset = await sendIntranet({
    query: EMAIL_PASSWORD_RESET,
    variables: {email: getTestEmail()}
  })

  expect(passwordReset).toMatchObject({
    data: null,
    errors: [{extensions: {code: 'NOT_FOUND'}}]
  })
})
