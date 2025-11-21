import faker from 'faker'
import getKysely from '../postgres/getKysely'
import {SIGNUP_WITH_PASSWORD_MUTATION, sendPublic, signUp} from './common'

test('Invite to team, works for ordinary email domain', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie, teamId} = user1
  const {email: inviteeEmail} = user2

  const inviteToTeam = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          error {
            title
            message
          }
          invitees
        }
      }
    `,
    variables: {
      teamId,
      invitees: ['foo@example.com', inviteeEmail]
    },
    cookie
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: ['foo@example.com', inviteeEmail]
      }
    }
  })
})

test('Invite to team, deny for untrusted domain', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie, teamId} = user1
  const {email: inviteeEmail} = user2
  const inviteToTeam = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          error {
            title
            message
          }
          invitees
        }
      }
    `,
    variables: {
      teamId,
      invitees: ['foo@qq.com', inviteeEmail]
    },
    cookie
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: [inviteeEmail]
      }
    }
  })
})

test('Team invite to an email acts as email verification', async () => {
  const user1 = await signUp()
  const {cookie, teamId} = user1

  const email = faker.internet.email().toLowerCase()

  const inviteToTeam = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          error {
            title
            message
          }
          invitees
        }
      }
    `,
    variables: {
      teamId,
      invitees: [email]
    },
    cookie
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: [email]
      }
    }
  })

  const pg = getKysely()
  const inviteToken = await pg
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', email)
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()

  const password = faker.internet.password()
  const signUpWithInvite = await sendPublic({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email,
      password,
      pseudoId: null,
      invitationToken: inviteToken.token,
      params: ''
    }
  })

  expect(signUpWithInvite).toMatchObject({
    cookie: expect.anything(),
    data: {
      signUpWithPassword: {
        error: null,
        user: {
          id: expect.anything(),
          email
        }
      }
    }
  })
})

test('Team invite to an email acts as email verification only if the email matches', async () => {
  const user1 = await signUp()
  const {cookie, teamId} = user1

  const email = faker.internet.email().toLowerCase()

  const inviteToTeam = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          error {
            title
            message
          }
          invitees
        }
      }
    `,
    variables: {
      teamId,
      invitees: [email]
    },
    cookie
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: [email]
      }
    }
  })

  const pg = getKysely()
  const inviteToken = await pg
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', email)
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()

  const differentEmail = email.replace('@', '+diff@')
  const password = faker.internet.password()

  const signUpWithInvite = await sendPublic({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email: differentEmail,
      password,
      pseudoId: null,
      invitationToken: inviteToken.token,
      params: ''
    }
  })

  expect(signUpWithInvite).toMatchObject({
    data: {
      signUpWithPassword: {
        error: {
          message: 'Verification required. Check your inbox.'
        },
        user: null
      }
    }
  })
})
