import faker from 'faker'
import getKysely from '../postgres/getKysely'
import {sendIntranet, sendPublic, signUpWithEmail} from './common'

const REMOVE_AUTH_IDENTITY_MUTATION = `
  mutation RemoveAuthIdentity(
    $domain: String
    $userIds: [ID!]
    $emails: [String!]
    $identityType: AuthIdentityTypeEnum!
    $addLocal: Boolean!
    $sendEmail: Boolean
  ) {
    removeAuthIdentity(
      domain: $domain
      userIds: $userIds
      emails: $emails
      identityType: $identityType
      addLocal: $addLocal
      sendEmail: $sendEmail
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RemoveAuthIdentitySuccess {
        users {
          id
        }
      }
    }
  }
`

test('emailPasswordReset succeeds for abandoned SSO user with no local identity', async () => {
  const domain = `abandoned-sso-${Date.now()}.example`
  const email = `user@${domain}`
  const {userId} = await signUpWithEmail(email)

  // Simulate an abandoned SSO user by stripping all identities from the account,
  // leaving them unable to log in via their original method.
  const pg = getKysely()
  await pg.updateTable('User').set({identities: []}).where('id', '=', userId).execute()

  const result = await sendPublic({
    query: `
      mutation EmailPasswordReset($email: ID!) {
        emailPasswordReset(email: $email) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on EmailPasswordResetSuccess {
            success
          }
        }
      }
    `,
    variables: {email}
  })

  // Should succeed instead of returning IDENTITY_NOT_FOUND
  expect(result).toMatchObject({
    data: {
      emailPasswordReset: {
        success: true
      }
    }
  })

  // A password reset request should have been created
  const resetRequest = await pg
    .selectFrom('PasswordResetRequest')
    .selectAll()
    .where('email', '=', email)
    .where('isValid', '=', true)
    .executeTakeFirst()
  expect(resetRequest).toBeTruthy()

  // The user should now have a LOCAL identity so they can complete the reset
  const user = await pg
    .selectFrom('User')
    .select('identities')
    .where('id', '=', userId)
    .executeTakeFirst()
  const identities = user?.identities as Array<{type: string}>
  const localIdentity = identities?.find((identity) => identity.type === 'LOCAL')
  expect(localIdentity).toBeTruthy()
})

test('removeAuthIdentity accepts emails parameter', async () => {
  const email = faker.internet.email().toLowerCase()
  const {userId} = await signUpWithEmail(email)

  const result = await sendIntranet({
    query: REMOVE_AUTH_IDENTITY_MUTATION,
    variables: {
      emails: [email],
      identityType: 'LOCAL',
      addLocal: false,
      sendEmail: false
    }
  })

  expect(result).toMatchObject({
    data: {
      removeAuthIdentity: {
        users: expect.arrayContaining([{id: userId}])
      }
    }
  })
})

test('removeAuthIdentity accepts userIds parameter', async () => {
  const email = faker.internet.email().toLowerCase()
  const {userId} = await signUpWithEmail(email)

  const result = await sendIntranet({
    query: REMOVE_AUTH_IDENTITY_MUTATION,
    variables: {
      userIds: [userId],
      identityType: 'LOCAL',
      addLocal: false,
      sendEmail: false
    }
  })

  expect(result).toMatchObject({
    data: {
      removeAuthIdentity: {
        users: expect.arrayContaining([{id: userId}])
      }
    }
  })
})
