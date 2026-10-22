import faker from 'faker'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import {
  getTestDomain,
  getTestEmail,
  SIGNUP_WITH_PASSWORD_MUTATION,
  sendPublic,
  signUp
} from './common'

const INVITE_TO_TEAM_MUTATION = `
  mutation InviteToTeam($teamId: ID!, $meetingId: ID, $invitees: [Email!]!) {
    inviteToTeam(teamId: $teamId, meetingId: $meetingId, invitees: $invitees) {
      team {
        id
      }
      invitees {
        email
        status
        message
        suggestedEmail
      }
    }
  }
`

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

const inviteToTeam = (cookie: string, teamId: string, invitees: string[], meetingId?: string) =>
  sendPublic({
    query: INVITE_TO_TEAM_MUTATION,
    variables: {teamId, invitees, meetingId},
    cookie
  })

const sent = (email: string) => ({email, status: 'sent', message: null, suggestedEmail: null})

const getInvitationToken = async (email: string, teamId: string) => {
  const {token} = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', email)
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()
  return token
}

test('Invite to team, works for ordinary email domain', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie, teamId} = user1
  const {email: inviteeEmail} = user2
  const newcomerEmail = getTestEmail()

  const res = await inviteToTeam(cookie, teamId, [newcomerEmail, inviteeEmail])

  expect(res).toMatchObject({
    data: {
      inviteToTeam: {
        team: {id: teamId},
        invitees: [sent(newcomerEmail), sent(inviteeEmail)]
      }
    }
  })
})

test('Invite to team, deny for untrusted domain', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie, teamId} = user1
  const {email: inviteeEmail} = user2

  const res = await inviteToTeam(cookie, teamId, ['foo@qq.com', 'bar@vip.qq.com', inviteeEmail])

  expect(res.data.inviteToTeam.invitees).toEqual([
    {
      email: 'foo@qq.com',
      status: 'blockedDomain',
      message: expect.stringContaining('qq.com'),
      suggestedEmail: null
    },
    expect.objectContaining({email: 'bar@vip.qq.com', status: 'blockedDomain'}),
    sent(inviteeEmail)
  ])
})

test('Invite to team explains every address it skipped, in the order given', async () => {
  const user1 = await signUp()
  const {cookie, teamId, email: viewerEmail} = user1
  const newcomerEmail = getTestEmail()

  const res = await inviteToTeam(cookie, teamId, [
    viewerEmail,
    'not-an-email',
    `  ${newcomerEmail.toUpperCase()} `,
    newcomerEmail,
    'two@example.com,three@example.com'
  ])

  expect(res.data.inviteToTeam.invitees).toEqual([
    expect.objectContaining({
      email: viewerEmail,
      status: 'alreadyOnTeam',
      message: expect.stringContaining('Already on')
    }),
    expect.objectContaining({email: 'not-an-email', status: 'invalid'}),
    sent(newcomerEmail),
    expect.objectContaining({email: 'two@example.com,three@example.com', status: 'invalid'})
  ])
  const invitations = await getKysely()
    .selectFrom('TeamInvitation')
    .select('email')
    .where('teamId', '=', teamId)
    .execute()
  expect(invitations).toEqual([{email: newcomerEmail}])
})

test('Invite to team does not email the same address again within the cooldown', async () => {
  const {cookie, teamId} = await signUp()
  const email = getTestEmail()

  const first = await inviteToTeam(cookie, teamId, [email])
  const second = await inviteToTeam(cookie, teamId, [email])

  expect(first.data.inviteToTeam.invitees).toEqual([sent(email)])
  expect(second.data.inviteToTeam.invitees).toEqual([
    {
      email,
      status: 'alreadyInvited',
      message: expect.stringMatching(/^Invited just now\./),
      suggestedEmail: null
    }
  ])
  const invitations = await getKysely()
    .selectFrom('TeamInvitation')
    .select('id')
    .where('teamId', '=', teamId)
    .where('email', '=', email)
    .execute()
  expect(invitations).toHaveLength(1)
})

test('Invite to team refuses more than 50 addresses at once', async () => {
  const {cookie, teamId} = await signUp()
  const invitees = Array.from({length: 51}, () => getTestEmail())

  const res = await inviteToTeam(cookie, teamId, invitees)

  expect(res.data).toBeNull()
  expect(res.errors).toEqual([
    expect.objectContaining({
      message: 'You can invite up to 50 people at a time. Remove 1 and try again.',
      extensions: expect.objectContaining({code: 'TOO_MANY_INVITEES'})
    })
  ])
})

test('Invite to team refuses a meeting that is not on the team', async () => {
  const {cookie, teamId} = await signUp()

  const res = await inviteToTeam(cookie, teamId, [getTestEmail()], 'notARealMeetingId')

  expect(res.data).toBeNull()
  expect(res.errors).toEqual([expect.objectContaining({message: 'Meeting not found'})])
})

test('Only members of a team can invite to it', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])

  const res = await inviteToTeam(user2.cookie, user1.teamId, [getTestEmail()])

  expect(res.data).toBeNull()
  expect(res.errors).toEqual([expect.objectContaining({message: 'Viewer is not on team'})])
  const invitations = await getKysely()
    .selectFrom('TeamInvitation')
    .select('id')
    .where('teamId', '=', user1.teamId)
    .execute()
  expect(invitations).toHaveLength(0)
})

test('Invite to team explains the approved domains, but lets existing org members through', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie, teamId, orgId, userId} = user1
  await inviteToTeam(cookie, teamId, [user2.email])
  const accepted = await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: await getInvitationToken(user2.email, teamId)},
    cookie: user2.cookie
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()

  const approvedDomain = getTestDomain()
  await getKysely()
    .insertInto('OrganizationApprovedDomain')
    .values({orgId, addedByUserId: userId, domain: approvedDomain})
    .execute()
  const addTeamRes = await sendPublic({
    query: `
      mutation AddTeam($newTeam: NewTeamInput!) {
        addTeam(newTeam: $newTeam) {
          team { id }
        }
      }
    `,
    variables: {newTeam: {name: `Team ${generateUID()}`, orgId, isPublic: false}},
    cookie
  })
  const team2Id = addTeamRes.data.addTeam.team.id
  const approvedEmail = getTestEmail(approvedDomain)
  const offListEmail = getTestEmail()

  // the refreshed token includes team2. A raw Set-Cookie header is not a valid Cookie header, so pick out the auth cookie
  const authToken = addTeamRes.cookie.split('__Host-Http-authToken=')[1].split(';')[0]
  const res = await inviteToTeam(`__Host-Http-authToken=${authToken}`, team2Id, [
    approvedEmail,
    offListEmail,
    user2.email
  ])

  expect(res.data.inviteToTeam.invitees).toEqual([
    sent(approvedEmail),
    {
      email: offListEmail,
      status: 'notApproved',
      message: expect.stringContaining(approvedDomain),
      suggestedEmail: null
    },
    sent(user2.email)
  ])
})

test('Invite to team stops a team that never had an invitation accepted at 100', async () => {
  const {cookie, teamId, userId} = await signUp()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60)
  await getKysely()
    .insertInto('TeamInvitation')
    .values(
      Array.from({length: 98}, () => ({
        id: generateUID(),
        email: getTestEmail(),
        invitedBy: userId,
        teamId,
        token: generateUID(),
        expiresAt,
        isMassInvite: false
      }))
    )
    .execute()

  const tooMany = await inviteToTeam(cookie, teamId, [
    getTestEmail(),
    getTestEmail(),
    getTestEmail()
  ])
  const justEnough = await inviteToTeam(cookie, teamId, [getTestEmail(), getTestEmail()])
  const oneTooMany = await inviteToTeam(cookie, teamId, [getTestEmail()])

  expect(tooMany.errors).toEqual([
    expect.objectContaining({
      message: expect.stringContaining('You can invite 2 more people now'),
      extensions: expect.objectContaining({code: 'UNACCEPTED_INVITATION_LIMIT'})
    })
  ])
  expect(justEnough.data.inviteToTeam.invitees).toEqual([
    expect.objectContaining({status: 'sent'}),
    expect.objectContaining({status: 'sent'})
  ])
  expect(oneTooMany.errors).toEqual([
    expect.objectContaining({
      message: expect.stringContaining("can't send more invitations until someone accepts one"),
      extensions: expect.objectContaining({code: 'UNACCEPTED_INVITATION_LIMIT'})
    })
  ])
})

test('Team invite to an email acts as email verification', async () => {
  const user1 = await signUp()
  const {cookie, teamId} = user1

  const email = getTestEmail()

  const res = await inviteToTeam(cookie, teamId, [email])

  expect(res.data.inviteToTeam.invitees).toEqual([sent(email)])

  const password = faker.internet.password()
  const signUpWithInvite = await sendPublic({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email,
      password,
      pseudoId: null,
      invitationToken: await getInvitationToken(email, teamId),
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

  const invitedEmail = getTestEmail()

  await inviteToTeam(user1Cookie, teamId, [invitedEmail])

  const acceptResult = await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: await getInvitationToken(invitedEmail, teamId)},
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

  const email = getTestEmail()

  const res = await inviteToTeam(cookie, teamId, [email])

  expect(res.data.inviteToTeam.invitees).toEqual([sent(email)])

  const differentEmail = email.replace('@', '+diff@')
  const password = faker.internet.password()

  const signUpWithInvite = await sendPublic({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email: differentEmail,
      password,
      pseudoId: null,
      invitationToken: await getInvitationToken(email, teamId),
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
  await inviteToTeam(user1Cookie, teamId, [user2Email])
  const token = await getInvitationToken(user2Email, teamId)

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

test('Pending invites are invalidated when user is removed from org', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {cookie: user1Cookie, teamId: team1Id, orgId} = user1
  const {cookie: user2Cookie, userId: user2Id, email: user2Email} = user2

  // user1 invites user2 to team1 — user2 accepts and joins org1
  await inviteToTeam(user1Cookie, team1Id, [user2Email])

  await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: await getInvitationToken(user2Email, team1Id)},
    cookie: user2Cookie
  })

  // user2 is now in org1. user1 creates a second team and invites user2 in one call —
  // inviteToTeamHelper runs inside addTeam after tms is mutated, so the auth check is satisfied
  const addTeamResult = await sendPublic({
    query: `
      mutation AddTeam($newTeam: NewTeamInput!, $invitees: [Email!]) {
        addTeam(newTeam: $newTeam, invitees: $invitees) {
          error { message }
          team { id }
        }
      }
    `,
    variables: {newTeam: {name: 'Team 2', orgId, isPublic: false}, invitees: [user2Email]},
    cookie: user1Cookie
  })

  const team2Id = addTeamResult.data.addTeam.team.id
  const pendingToken = await getInvitationToken(user2Email, team2Id)

  // user1 (billing leader) removes user2 from org1
  await sendPublic({
    query: `
      mutation RemoveOrgUsers($userIds: [ID!]!, $orgId: ID!) {
        removeOrgUsers(userIds: $userIds, orgId: $orgId) {
          ... on RemoveOrgUsersSuccess {
            removedUserIds
          }
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {userIds: [user2Id], orgId},
    cookie: user1Cookie
  })

  // user2 tries to accept the still-pending invite for team2 — should fail because it was expired on removal
  const reAcceptResult = await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: pendingToken},
    cookie: user2Cookie
  })

  expect(reAcceptResult).toMatchObject({
    data: {
      acceptTeamInvitation: {
        error: {message: 'expired'},
        team: null
      }
    }
  })
})
