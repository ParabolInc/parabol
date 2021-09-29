import {sendIntranet, signUp} from './common'

test('Email password reset', async () => {
  const {email} = await signUp()

  const passwordReset = await sendIntranet({
    query: `
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
          }
        }
      }
    `,
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
