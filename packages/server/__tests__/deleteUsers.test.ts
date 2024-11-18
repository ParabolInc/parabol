import {sendIntranet, signUp} from './common'

test('Delete users by email', async () => {
  const user1 = await signUp()
  const user2 = await signUp()
  const emails = [user1.email, user2.email]
  const userIds = [user1.userId, user2.userId]

  const deleteUsers = await sendIntranet({
    query: `
      mutation DeleteUsers($emails: [Email!]!) {
        deleteUsers(emails: $emails) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on DeleteUsersSuccess {
            success
          }
        }
      }
    `,
    variables: {
      emails
    }
  })

  expect(deleteUsers).toMatchObject({
    data: {
      deleteUsers: {
        success: true
      }
    }
  })

  // Verify both users were deleted
  for (const userId of userIds) {
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
          email: expect.not.stringMatching(emails[userIds.indexOf(userId)] || '')
        }
      }
    })
  }
}, 40000)
