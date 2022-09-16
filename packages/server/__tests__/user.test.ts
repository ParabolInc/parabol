import faker from 'faker'
import {sendIntranet, signUp, signUpWithEmail} from './common'

test('Get user by id', async () => {
  const {email, userId} = await signUp()

  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          email
          organizations {
            id
          }
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
        email,
        organizations: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })
})

test('Get user by email', async () => {
  const {email, userId} = await signUp()

  const user = await sendIntranet({
    query: `
      query User($email: String!) {
        user(email: $email) {
          id
          email
          organizations {
            id
          }
        }
      }
    `,
    variables: {
      email
    },
    isPrivate: true
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        email,
        organizations: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })
})

test('First user is patientZero', async () => {
  const domain = faker.internet.domainName()
  const email1 = `${faker.internet.userName()}@${domain}`
  const email2 = `${faker.internet.userName()}@${domain}`

  const {userId: user1Id} = await signUpWithEmail(email1)
  const {userId: user2Id} = await signUpWithEmail(email2)

  const query = `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          isPatientZero
        }
      }
    `
  const user1 = await sendIntranet({
    query,
    variables: {
      userId: user1Id
    },
    isPrivate: true
  })

  expect(user1).toMatchObject({
    data: {
      user: {
        id: user1Id,
        isPatientZero: true
      }
    }
  })

  const user2 = await sendIntranet({
    query,
    variables: {
      userId: user2Id
    },
    isPrivate: true
  })

  expect(user2).toMatchObject({
    data: {
      user: {
        id: user2Id,
        isPatientZero: false
      }
    }
  })
})
