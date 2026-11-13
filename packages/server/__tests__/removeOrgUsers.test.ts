import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const acceptInvitation = async <Invitee extends {cookie: string; email: string}>(
  teamId: string,
  invitee: Invitee
) => {
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
  const authToken = accepted.cookie.split('__Host-Http-authToken=')[1].split(';')[0]
  return {...invitee, cookie: `__Host-Http-authToken=${authToken}`}
}

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
  const members = []
  for (const invitee of invitees) {
    members.push(await acceptInvitation(teamId, invitee))
  }
  const ownerLeft = await sendPublic({
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
  expect(ownerLeft.data.removeTeamMember.error).toBeNull()
  return {cookie, orgId, teamId, members}
}

const createTask = async (teamId: string, member: {cookie: string; userId: string}) => {
  const created = await sendPublic({
    query: `
      mutation CreateTask($newTask: CreateTaskInput!) {
        createTask(newTask: $newTask) {
          error {
            message
          }
        }
      }
    `,
    variables: {newTask: {teamId, userId: member.userId, status: 'active'}},
    cookie: member.cookie
  })
  expect(created.errors).toBeUndefined()
  expect(created.data.createTask.error).toBeNull()
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

test('Removing the lead with another member hands the lead and their tasks to a member who stays', async () => {
  const {cookie, orgId, teamId, members} = await createTeamOfInvitees(3)
  const [oldestMember, remainingMember, lead] = members
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
  await createTask(teamId, lead!)
  await createTask(teamId, oldestMember!)

  await removeOrgUsers(cookie, orgId, [lead!.userId, oldestMember!.userId])

  const pg = getKysely()
  const activeMembers = await pg
    .selectFrom('TeamMember')
    .select(['userId', 'isLead'])
    .where('teamId', '=', teamId)
    .where('isNotRemoved', '=', true)
    .execute()
  expect(activeMembers).toEqual([{userId: remainingMember!.userId, isLead: true}])
  const taskOwners = await pg
    .selectFrom('Task')
    .select('userId')
    .where('teamId', '=', teamId)
    .where(sql<boolean>`'archived' != ALL(tags)`)
    .execute()
  expect(taskOwners).toEqual([{userId: remainingMember!.userId}, {userId: remainingMember!.userId}])
}, 15000)

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
