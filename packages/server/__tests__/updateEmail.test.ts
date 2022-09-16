import faker from 'faker'
import {sendIntranet, signUp} from './common'

test('Update user email with unknown email fails', async () => {
  const email = faker.internet.email().toLowerCase()
  const newEmail = faker.internet.email().toLowerCase()

  const updateEmail = await sendIntranet({
    query: `
      mutation UpdateEmail($oldEmail: Email!, $newEmail: Email!) {
        updateEmail(oldEmail: $oldEmail, newEmail: $newEmail)
      }
    `,
    variables: {
      oldEmail: email,
      newEmail
    },
    isPrivate: true
  })

  expect(updateEmail).toMatchObject({
    data: null
  })
})

test('Update user email', async () => {
  const {email, userId} = await signUp()
  const newEmail = faker.internet.email().toLowerCase()

  const updateEmail = await sendIntranet({
    query: `
      mutation UpdateEmail($oldEmail: Email!, $newEmail: Email!) {
        updateEmail(oldEmail: $oldEmail, newEmail: $newEmail)
      }
    `,
    variables: {
      oldEmail: email,
      newEmail
    },
    isPrivate: true
  })

  expect(updateEmail).toMatchObject({
    data: {
      updateEmail: true
    }
  })

  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
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
        email: newEmail
      }
    }
  })
})
