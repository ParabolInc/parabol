import {sendIntranet, signUp} from './common'

// As of 2022-01-11, this test is not testing the AutoPauseUsers mutation
// because there is no easy way to set the lastSeenAt field to a date in the past
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
        inactive: false // user will have lastSeenAt populated upon sign up so won't be inactive
      }
    }
  })
})
