import AuthToken from '../database/types/AuthToken'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

const SIGN_OUT_MUTATION = `
  mutation SignOut {
    signOut
  }
`

const VIEWER_QUERY = `
  query Viewer {
    viewer {
      id
    }
  }
`

test('Sign out clears cookie', async () => {
  const {cookie} = await signUp()

  const signOut = await sendPublic({
    query: SIGN_OUT_MUTATION,
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

test('Sign out only invalidates the signed-out session', async () => {
  const {userId} = await signUp()

  // Two separate tokens = two independent sessions (each gets its own jti via randomUUID)
  const session1Token = encodeAuthToken(new AuthToken({sub: userId}))
  const session2Token = encodeAuthToken(new AuthToken({sub: userId}))

  // Both sessions should work before sign out
  const [before1, before2] = await Promise.all([
    sendPublic({query: VIEWER_QUERY, bearerToken: session1Token}),
    sendPublic({query: VIEWER_QUERY, bearerToken: session2Token})
  ])
  expect(before1.data?.viewer?.id).toBe(userId)
  expect(before2.data?.viewer?.id).toBe(userId)

  // Sign out of session 1
  await sendPublic({query: SIGN_OUT_MUTATION, bearerToken: session1Token})

  // Session 1 should now be rejected
  const after1 = await sendPublic({query: VIEWER_QUERY, bearerToken: session1Token})
  expect(after1.errors?.[0]?.extensions?.code).toBe('UNAUTHORIZED')

  // Session 2 should still work
  const after2 = await sendPublic({query: VIEWER_QUERY, bearerToken: session2Token})
  expect(after2.data?.viewer?.id).toBe(userId)
})
