import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const acceptInvitation = async (teamId: string, invitee: {cookie: string; email: string}) => {
  const {token} = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', invitee.email)
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()
  const accepted = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          error {
            message
          }
        }
      }
    `,
    variables: {invitationToken: token},
    cookie: invitee.cookie
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
}

// the owner, the org's billing leader, creates the team, then leaves it to members who joined in order
const createTeamOfInvitees = async (memberCount: number) => {
  const [owner, ...invitees] = await Promise.all(
    Array.from({length: memberCount + 1}, () => signUp())
  )
  const {cookie, orgId, userId} = owner!
  const created = await sendPublic({
    query: `
      mutation AddTeam($newTeam: NewTeamInput!, $invitees: [Email!]) {
        addTeam(newTeam: $newTeam, invitees: $invitees) {
          team {
            id
          }
        }
      }
    `,
    variables: {
      newTeam: {name: `Team ${Date.now()}`, orgId, isPublic: false},
      invitees: invitees.map(({email}) => email)
    },
    cookie
  })
  const teamId: string = created.data.addTeam.team.id
  for (const invitee of invitees) {
    await acceptInvitation(teamId, invitee)
  }
  const left = await sendPublic({
    query: `
      mutation RemoveTeamMember($teamId: ID!, $userId: ID!) {
        removeTeamMember(teamId: $teamId, userId: $userId) {
          error {
            message
          }
        }
      }
    `,
    variables: {teamId, userId},
    cookie
  })
  expect(left.data.removeTeamMember.error).toBeNull()
  return {cookie, orgId, teamId, members: invitees}
}

const removeOrgUsers = async (cookie: string, orgId: string, userIds: string[]) => {
  const removed = await sendPublic({
    query: `
      mutation RemoveOrgUsers($orgId: ID!, $userIds: [ID!]!) {
        removeOrgUsers(orgId: $orgId, userIds: $userIds) {
          __typename
        }
      }
    `,
    variables: {orgId, userIds},
    cookie
  })
  expect(removed.data.removeOrgUsers.__typename).toBe('RemoveOrgUsersSuccess')
}

test('Removing the team lead with other members at once hands the lead to a remaining member', async () => {
  const {cookie, orgId, teamId, members} = await createTeamOfInvitees(3)
  const [firstMember, remainingMember, lead] = members
  const promoted = await sendPublic({
    query: `
      mutation PromoteToTeamLead($teamId: ID!, $userId: ID!) {
        promoteToTeamLead(teamId: $teamId, userId: $userId) {
          error {
            message
          }
        }
      }
    `,
    variables: {teamId, userId: lead!.userId},
    cookie
  })
  expect(promoted.data.promoteToTeamLead.error).toBeNull()

  await removeOrgUsers(cookie, orgId, [lead!.userId, firstMember!.userId])

  const team = await sendPublic({
    query: `
      query TeamLead($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            teamLead {
              userId
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })
  expect(team).toEqual({
    data: {viewer: {team: {teamLead: {userId: remainingMember!.userId}}}}
  })
})

test('Removing every member of a team at once archives it', async () => {
  const {cookie, orgId, teamId, members} = await createTeamOfInvitees(2)

  await removeOrgUsers(
    cookie,
    orgId,
    members.map(({userId}) => userId)
  )

  const team = await getKysely()
    .selectFrom('Team')
    .select('isArchived')
    .where('id', '=', teamId)
    .executeTakeFirstOrThrow()
  expect(team.isArchived).toBe(true)
})
