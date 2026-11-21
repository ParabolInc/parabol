import {randomUUIDv7} from 'crypto'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

const CHANGE_TASK_TEAM = `
  mutation ChangeTaskTeam($taskId: ID!, $teamId: ID!) {
    changeTaskTeam(taskId: $taskId, teamId: $teamId) {
      task {
        id
        teamId
      }
    }
  }
`

const authTokenFor = async (userId: string) => {
  const teamMembers = await getKysely()
    .selectFrom('TeamMember')
    .select('teamId')
    .where('userId', '=', userId)
    .where('isNotRemoved', '=', true)
    .execute()
  return encodeAuthToken(new AuthToken({sub: userId, tms: teamMembers.map(({teamId}) => teamId)}))
}

const addTeamMember = (teamId: string, userId: string) =>
  getKysely()
    .insertInto('TeamMember')
    .values({id: TeamMemberId.join(teamId, userId), teamId, userId, isLead: false})
    .execute()

const addTeam = async (orgId: string) => {
  const teamId = randomUUIDv7()
  await getKysely()
    .insertInto('Team')
    .values({id: teamId, name: `Team ${teamId}`, orgId})
    .execute()
  return teamId
}

const addTask = async (teamId: string, userId: string | null, createdBy: string) => {
  const taskId = `${teamId}::${generateUID()}`
  await getKysely()
    .insertInto('Task')
    .values({
      id: taskId,
      content: JSON.stringify({}),
      createdBy,
      plaintextContent: '',
      teamId,
      userId,
      status: 'active'
    })
    .execute()
  return taskId
}

const getTaskTeamId = async (taskId: string) => {
  const {teamId} = await getKysely()
    .selectFrom('Task')
    .select('teamId')
    .where('id', '=', taskId)
    .executeTakeFirstOrThrow()
  return teamId
}

const changeTaskTeam = async (taskId: string, teamId: string, userId: string) =>
  sendPublic({
    query: CHANGE_TASK_TEAM,
    variables: {taskId, teamId},
    bearerToken: await authTokenFor(userId)
  })

const setUp = async () => {
  const viewer = await signUp()
  const teammate = await signUp()
  const otherTeamId = await addTeam(viewer.orgId)
  await Promise.all([
    addTeamMember(viewer.teamId, teammate.userId),
    addTeamMember(otherTeamId, viewer.userId)
  ])
  return {viewer, teammate, otherTeamId}
}

test('moves a teammate’s task to another team they are both on', async () => {
  const {viewer, teammate, otherTeamId} = await setUp()
  await addTeamMember(otherTeamId, teammate.userId)
  const taskId = await addTask(viewer.teamId, teammate.userId, teammate.userId)

  const res = await changeTaskTeam(taskId, otherTeamId, viewer.userId)

  expect(res).toEqual({data: {changeTaskTeam: {task: {id: taskId, teamId: otherTeamId}}}})
  expect(await getTaskTeamId(taskId)).toBe(otherTeamId)
})

test('moves an unassigned task', async () => {
  const {viewer, teammate, otherTeamId} = await setUp()
  const taskId = await addTask(viewer.teamId, null, teammate.userId)

  const res = await changeTaskTeam(taskId, otherTeamId, viewer.userId)

  expect(res).toEqual({data: {changeTaskTeam: {task: {id: taskId, teamId: otherTeamId}}}})
  expect(await getTaskTeamId(taskId)).toBe(otherTeamId)
})

test('refuses to move a task to a team its assignee is not on', async () => {
  const {viewer, teammate, otherTeamId} = await setUp()
  const taskId = await addTask(viewer.teamId, teammate.userId, teammate.userId)

  const res = await changeTaskTeam(taskId, otherTeamId, viewer.userId)

  expect(res.errors).toMatchObject([{extensions: {code: 'CONFLICT'}}])
  expect(await getTaskTeamId(taskId)).toBe(viewer.teamId)
})

test('refuses to move a task off a team the viewer is not on', async () => {
  const {viewer, teammate, otherTeamId} = await setUp()
  await addTeamMember(otherTeamId, teammate.userId)
  const taskId = await addTask(teammate.teamId, teammate.userId, teammate.userId)

  const res = await changeTaskTeam(taskId, otherTeamId, viewer.userId)

  expect(res.errors).toMatchObject([{extensions: {code: 'FORBIDDEN'}}])
  expect(await getTaskTeamId(taskId)).toBe(teammate.teamId)
})

test('refuses to move a task onto a team the viewer is not on', async () => {
  const {viewer, teammate} = await setUp()
  const taskId = await addTask(viewer.teamId, teammate.userId, teammate.userId)

  const res = await changeTaskTeam(taskId, teammate.teamId, viewer.userId)

  expect(res.errors).toMatchObject([{extensions: {code: 'FORBIDDEN'}}])
  expect(await getTaskTeamId(taskId)).toBe(viewer.teamId)
})
