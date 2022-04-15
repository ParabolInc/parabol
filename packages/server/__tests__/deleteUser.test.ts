import {sendIntranet, signUp} from './common'

test('Delete user', async () => {
  const {email, userId} = await signUp()

  const deleteUser = await sendIntranet({
    query: `
      mutation DeleteUser($email: ID) {
        deleteUser(email: $email) {
          error {
            title
            message
          }
        }
      }
    `,
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
    },
    isPrivate: true
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
