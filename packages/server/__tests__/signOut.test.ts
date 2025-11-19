import {sendPublic, signUp} from './common'

test('Sign out clears cookie', async () => {
  const {cookie} = await signUp()

  const signOut = await sendPublic({
    query: `
      mutation SignOut {
        signOut
      }
    `,
    variables: {},
    cookie
  })

  expect(signOut).toMatchObject({
    cookie: expect.stringContaining('__Host-Http-authToken=;'),
    data: {
      signOut: true
    }
  })
})
