import {sendIntranet, signUp} from './common'

test('Autopause users who where never active', async () => {
  const {userId} = await signUp()
  const paused = await sendIntranet({
    query: `
      mutation AutopauseUsers {
        autopauseUsers
      }
    `,
    isPrivate: true
  })

  expect(paused).toMatchObject({
    data: {
      autopauseUsers: expect.anything()
    }
  })
  expect(paused.data.autopauseUsers).toBeGreaterThan(0)

  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          inactive
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
        inactive: true
      }
    }
  })
})
