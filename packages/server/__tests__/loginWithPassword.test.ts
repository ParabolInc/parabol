import {getTestEmail, sendPublic, signUpWithPasswordMutation} from './common'

test('Login after signup', async () => {
  const {email, password} = await signUpWithPasswordMutation(getTestEmail())

  const login = await sendPublic({
    query: `
      mutation LoginWithPasswordMutation($email: ID!, $password: String!) {
        loginWithPassword(email: $email, password: $password) {
          user {
            tms
            id
            email
            picture
            preferredName
            createdAt
            lastSeenAt
          }
        }
      }
    `,
    variables: {email, password}
  })
  expect(login).toMatchObject({
    cookie: expect.anything(),
    data: {
      loginWithPassword: {
        user: {
          id: expect.anything(),
          email
        }
      }
    }
  })
  const lastSeenAt = Date.parse(login.data.loginWithPassword.user.lastSeenAt)
  expect(lastSeenAt).toBeGreaterThan(Date.now() - 1000 * 60) // lastSeenAt should be more recent than 1 minute ago
  expect(lastSeenAt).toBeLessThan(Date.now())
})

test('A wrong password fails the login with UNAUTHENTICATED', async () => {
  const {email} = await signUpWithPasswordMutation(getTestEmail())

  const login = await sendPublic({
    query: `
      mutation LoginWithPasswordMutation($email: ID!, $password: String!) {
        loginWithPassword(email: $email, password: $password) {
          userId
        }
      }
    `,
    variables: {email, password: 'not-the-password'}
  })

  expect(login).toMatchObject({
    data: null,
    errors: [{message: 'Invalid email or password', extensions: {code: 'UNAUTHENTICATED'}}]
  })
})
