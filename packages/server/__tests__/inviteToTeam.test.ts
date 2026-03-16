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

test('Existing user cannot accept a team invitation sent to a different email', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie: user1Cookie, teamId} = user1
  const {cookie: user2Cookie} = user2

  const invitedEmail = faker.internet.email().toLowerCase()

  await sendPublic({
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
    variables: {teamId, invitees: [invitedEmail]},
    cookie: user1Cookie
  })

  const pg = getKysely()
  const {token} = await pg
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', invitedEmail)
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()

  const acceptResult = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          error {
            message
          }
          team {
            id
          }
        }
      }
    `,
    variables: {invitationToken: token},
    cookie: user2Cookie
  })

  expect(acceptResult).toMatchObject({
    data: {
      acceptTeamInvitation: {
        error: {
          message: 'notFound'
        },
        team: null
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

test('Accepted invite token cannot be reused after leaving the team', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie: user1Cookie, teamId} = user1
  const {cookie: user2Cookie, userId: user2Id, email: user2Email} = user2

  // User1 invites user2 to their team
  await sendPublic({
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
    variables: {teamId, invitees: [user2Email]},
    cookie: user1Cookie
  })

  const pg = getKysely()
  const {token} = await pg
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', user2Email)
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()

  const ACCEPT_TEAM_INVITATION_MUTATION = `
    mutation AcceptTeamInvitation($invitationToken: ID!) {
      acceptTeamInvitation(invitationToken: $invitationToken) {
        error {
          message
        }
        team {
          id
        }
      }
    }
  `

  // User2 accepts the invite and joins the team
  const acceptResult = await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: token},
    cookie: user2Cookie
  })

  expect(acceptResult).toMatchObject({
    data: {
      acceptTeamInvitation: {
        error: null,
        team: {id: teamId}
      }
    }
  })

  // User2 leaves the team
  const teamMemberId = `${user2Id}::${teamId}`
  await sendPublic({
    query: `
      mutation RemoveTeamMember($teamMemberId: ID!) {
        removeTeamMember(teamMemberId: $teamMemberId) {
          error {
            message
          }
        }
      }
    `,
    variables: {teamMemberId},
    cookie: user2Cookie
  })

  // User2 tries to accept the same invite token again — should fail
  const reAcceptResult = await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: token},
    cookie: user2Cookie
  })

  expect(reAcceptResult).toMatchObject({
    data: {
      acceptTeamInvitation: {
        error: {
          message: 'accepted'
        },
        team: null
      }
    }
  })
})
