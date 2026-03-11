import {sendIntranet, sendPublic, signUp} from './common'

const DELETE_USER_MUTATION = `
  mutation DeleteUser($userId: ID, $email: ID) {
    deleteUser(userId: $userId, email: $email) {
      error {
        title
        message
      }
    }
  }
`

test('Delete user by admin invalidates their JWT', async () => {
  const {email, cookie} = await signUp()

  await sendIntranet({
    query: DELETE_USER_MUTATION,
    variables: {email}
  })

  // Old cookie should no longer work for authenticated operations
  const afterResult = await sendPublic({
    query: `query { viewer { id } }`,
    cookie
  })
  expect(afterResult.errors).toBeDefined()
  expect(afterResult.errors[0]?.extensions?.code).toBe('UNAUTHORIZED')
})

test('User deleting themselves invalidates their JWT', async () => {
  const {userId, cookie} = await signUp()

  await sendPublic({
    query: DELETE_USER_MUTATION,
    variables: {userId},
    cookie
  })

  // Old cookie should no longer work
  const afterResult = await sendPublic({
    query: `query { viewer { id } }`,
    cookie
  })
  expect(afterResult.errors).toBeDefined()
  expect(afterResult.errors[0]?.extensions?.code).toBe('UNAUTHORIZED')
})

test('Delete user', async () => {
  const {email, userId} = await signUp()

  const deleteUser = await sendIntranet({
    query: DELETE_USER_MUTATION,
    variables: {
      email
    }
  })

  expect(deleteUser).toMatchObject({
    data: {
      deleteUser: {
        error: null
      }
    }
  })

  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          isRemoved
          email
        }
      }
    `,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        isRemoved: true,
        email: expect.not.stringMatching(email)
      }
    }
  })
}, 40000)
