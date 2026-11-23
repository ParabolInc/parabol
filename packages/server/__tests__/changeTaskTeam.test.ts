import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const CHANGE_TASK_TEAM = `
  mutation ChangeTaskTeam($taskId: ID!, $teamId: ID!) {
    changeTaskTeam(taskId: $taskId, teamId: $teamId) {
      task {
        id
        team {
          id
        }
      }
    }
  }
`

type Member = {cookie: string; email: string; teamId: string; userId: string}

const joinTeam = async <Guest extends Member>(host: Member, guest: Guest) => {
  const invited = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          invitees {
            status
          }
        }
      }
    `,
    variables: {teamId: host.teamId, invitees: [guest.email]},
    cookie: host.cookie
  })
  expect(invited.data.inviteToTeam.invitees).toEqual([{status: 'sent'}])
  const {token} = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('teamId', '=', host.teamId)
    .where('email', '=', guest.email)
    .executeTakeFirstOrThrow()
  const accepted = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          userErrors {
            code
          }
        }
      }
    `,
    variables: {invitationToken: token},
    cookie: guest.cookie
  })
  expect(accepted.data.acceptTeamInvitation.userErrors).toEqual([])
  const authToken = accepted.cookie.split('__Host-Http-authToken=')[1].split(';')[0]
  return {...guest, cookie: `__Host-Http-authToken=${authToken}`}
}

const createTask = async ({cookie, teamId, userId}: Member) => {
  const created = await sendPublic({
    query: `
      mutation CreateTask($newTask: CreateTaskInput!) {
        createTask(newTask: $newTask) {
          task {
            id
          }
        }
      }
    `,
    variables: {newTask: {status: 'active', teamId, userId}},
    cookie
  })
  return created.data.createTask.task.id as string
}

const changeTaskTeam = (taskId: string, teamId: string, cookie: string) =>
  sendPublic({query: CHANGE_TASK_TEAM, variables: {taskId, teamId}, cookie})

const signUpAssigneeAndTeammate = async () => {
  const [assignee, signedUpTeammate] = await Promise.all([signUp(), signUp()])
  const teammate = await joinTeam(assignee, signedUpTeammate)
  const taskId = await createTask(assignee)
  return {assignee, teammate, taskId}
}

test('a teammate moves another member’s task to a team they are both on', async () => {
  const {assignee, teammate, taskId} = await signUpAssigneeAndTeammate()
  await joinTeam(teammate, assignee)

  const res = await changeTaskTeam(taskId, teammate.teamId, teammate.cookie)

  expect(res).toEqual({
    data: {changeTaskTeam: {task: {id: taskId, team: {id: teammate.teamId}}}}
  })
})

test('the assignee moves their own task to another of their teams', async () => {
  const {assignee, teammate, taskId} = await signUpAssigneeAndTeammate()
  const joinedAssignee = await joinTeam(teammate, assignee)

  const res = await changeTaskTeam(taskId, teammate.teamId, joinedAssignee.cookie)

  expect(res).toEqual({
    data: {changeTaskTeam: {task: {id: taskId, team: {id: teammate.teamId}}}}
  })
})

test('a task cannot move to a team its assignee is not on', async () => {
  const {teammate, taskId} = await signUpAssigneeAndTeammate()

  const res = await changeTaskTeam(taskId, teammate.teamId, teammate.cookie)

  expect(res.errors).toEqual([
    expect.objectContaining({extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})})
  ])
})

test('an unassigned task moves to any team the viewer is on', async () => {
  const {teammate, taskId} = await signUpAssigneeAndTeammate()
  await getKysely().updateTable('Task').set({userId: null}).where('id', '=', taskId).execute()

  const res = await changeTaskTeam(taskId, teammate.teamId, teammate.cookie)

  expect(res).toEqual({
    data: {changeTaskTeam: {task: {id: taskId, team: {id: teammate.teamId}}}}
  })
})

test('a teammate cannot move another member’s private task', async () => {
  const {assignee, teammate, taskId} = await signUpAssigneeAndTeammate()
  await joinTeam(teammate, assignee)
  await getKysely()
    .updateTable('Task')
    .set({tags: ['private']})
    .where('id', '=', taskId)
    .execute()

  const res = await changeTaskTeam(taskId, teammate.teamId, teammate.cookie)

  expect(res.errors).toEqual([
    expect.objectContaining({extensions: expect.objectContaining({code: 'NOT_FOUND'})})
  ])
})

test('a task cannot be moved out of a team the viewer is not on', async () => {
  const [assignee, outsider] = await Promise.all([signUp(), signUp()])
  const taskId = await createTask(assignee)

  const res = await changeTaskTeam(taskId, outsider.teamId, outsider.cookie)

  expect(res.errors).toEqual([
    expect.objectContaining({extensions: expect.objectContaining({code: 'FORBIDDEN'})})
  ])
})
