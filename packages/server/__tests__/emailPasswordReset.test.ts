import {getTestEmail, sendIntranet, signUp} from './common'

const EMAIL_PASSWORD_RESET = `
  mutation EmailPasswordReset($email: ID!) {
    emailPasswordReset(email: $email) {
      ... on ErrorPayload {
        error {
          title
          message
        }
      }
      ... on EmailPasswordResetSuccess {
        success
        userErrors {
          code
        }
      }
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
        success: true,
        userErrors: []
      }
    }
  })
})

test('Email password reset for an unknown email says why no email was sent', async () => {
  const passwordReset = await sendIntranet({
    query: EMAIL_PASSWORD_RESET,
    variables: {email: getTestEmail()}
  })

  expect(passwordReset).toEqual({
    data: {
      emailPasswordReset: {
        success: false,
        userErrors: [{code: 'USER_NOT_FOUND'}]
      }
    }
  })
})
