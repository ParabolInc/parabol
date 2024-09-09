import faker from 'faker'
import createEmailVerification from '../email/createEmailVerification'
import getKysely from '../postgres/getKysely'
import {getUserTeams, sendIntranet, sendPublic} from './common'

const signUpVerified = async (email: string) => {
  const password = faker.internet.password()
  await sendPublic({
    query: `
      mutation SignUpWithPassword($email: ID!, $password: String!) {
        signUpWithPassword(email: $email, password: $password, params: "") {
          error {
            message
          }
        }
      }
    `,
    variables: {
      email,
      password
    }
  })
  // manually generate verification token so also the founder can be verified
  await createEmailVerification({email, password})

  const pg = getKysely()
  const verificationToken = (
    await pg
      .selectFrom('EmailVerification')
      .select('token')
      .where('email', '=', email)
      .executeTakeFirstOrThrow(() => new Error(`No verification token found for ${email}`))
  ).token

  const verifyEmail = await sendPublic({
    query: `
      mutation VerifyEmail($verificationToken: ID!) {
        verifyEmail(verificationToken: $verificationToken) {
          authToken
          user {
            id
            tms
            organizations {
              id
            }
            teams {
              id
            }
          }
        }
      }
    `,
    variables: {
      verificationToken
    }
  })
  expect(verifyEmail).toMatchObject({
    data: {
      verifyEmail: {
        authToken: expect.any(String),
        user: {
          id: expect.any(String)
        }
      }
    }
  })

  return {
    email,
    password,
    authToken: verifyEmail.data.verifyEmail.authToken,
    userId: verifyEmail.data.verifyEmail.user.id,
    user: verifyEmail.data.verifyEmail.user
  }
}

test('autoJoin on multiple teams does not create duplicate `OrganizationUser`s', async () => {
  const domain = `${faker.internet.domainWord()}.parabol.fun`

  const email = `${faker.internet.userName()}@${domain}`.toLowerCase()
  const {authToken, user, userId} = await signUpVerified(email)
  const orgId = user.organizations[0].id

  // set up 2nd teams for autoJoin
  await sendPublic({
    query: `
      mutation CreateTeam($orgId: ID!) {
        addTeam(newTeam: {
          name: "Mine",
          orgId: $orgId
        }) {
          team {
            id
          }
        }
      }
    `,
    variables: {
      orgId
    },
    authToken
  })

  const teamIds = (await getUserTeams(userId)).map(({id}) => id)
  const autoJoin = await sendPublic({
    query: `
      mutation AutoJoin($teamIds: [ID!]!) {
        updateAutoJoin(teamIds: $teamIds, autoJoin: true) {
          __typename
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {
      teamIds
    },
    authToken
  })
  expect(autoJoin).toMatchObject({
    data: {
      updateAutoJoin: {
        __typename: 'UpdateAutoJoinSuccess'
      }
    }
  })

  // enable email verification so the new user qualifies for autoJoin
  const approveDomains = await sendIntranet({
    query: `
      mutation ApprovedDomains($orgId: ID!, $emailDomains: [String!]!) {
        addApprovedOrganizationDomains(orgId: $orgId, emailDomains: $emailDomains) {
          __typename
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {
      orgId,
      emailDomains: [domain]
    }
  })
  expect(approveDomains).toMatchObject({
    data: {
      addApprovedOrganizationDomains: {
        __typename: 'AddApprovedOrganizationDomainsSuccess'
      }
    }
  })

  // sign up a new user with same domain and check number of `OrganizationUser`s
  const newEmail = `${faker.internet.userName()}@${domain}`.toLowerCase()
  const {user: newUser} = await signUpVerified(newEmail)

  expect(newUser.tms).toEqual(expect.arrayContaining(teamIds))
  expect(newUser.organizations).toMatchObject([
    {
      id: orgId
    }
  ])
})
