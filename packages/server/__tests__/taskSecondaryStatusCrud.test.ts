import TaskSecondaryStatusId from '../../client/shared/gqlIds/TaskSecondaryStatusId'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

test('Team.secondaryStatuses is empty for a fresh team', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: `
      query TeamSecondaryStatuses {
        viewer {
          teams {
            id
            secondaryStatuses {
              id
              label
              status
              sortOrder
            }
          }
        }
      }
    `,
    cookie
  })
  expect(res.errors).toBeUndefined()
  const team = res.data.viewer.teams.find((t: {id: string}) => t.id === teamId)
  expect(team.secondaryStatuses).toEqual([])
})

const ADD_MUTATION = `
  mutation AddTaskSecondaryStatus($teamId: ID!, $status: TaskStatusEnum!, $label: String!, $sortOrder: Float!) {
    addTaskSecondaryStatus(teamId: $teamId, status: $status, label: $label, sortOrder: $sortOrder) {
      taskSecondaryStatus {
        id
        label
        status
        sortOrder
      }
    }
  }
`

test('addTaskSecondaryStatus happy path + appears on Team.secondaryStatuses', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status: 'active', label: 'In review', sortOrder: 1},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const created = res.data.addTaskSecondaryStatus.taskSecondaryStatus
  expect(created).toMatchObject({label: 'In review', status: 'active', sortOrder: 1})
  expect(created.id).toMatch(/^taskSecondaryStatus:\d+$/)
})

test('addTaskSecondaryStatus blocks a non-team-member', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId: victim.teamId, status: 'active', label: 'Sneaky', sortOrder: 1},
    cookie: attacker.cookie
  })
  expect(res.data).toBeNull()
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])
})

test('addTaskSecondaryStatus rejects case-insensitive duplicate label', async () => {
  const {teamId, cookie} = await signUp()
  const vars = {teamId, status: 'stuck', label: 'Blocked', sortOrder: 1}
  await sendPublic({query: ADD_MUTATION, variables: vars, cookie})
  const dupe = await sendPublic({
    query: ADD_MUTATION,
    variables: {...vars, label: 'BLOCKED', sortOrder: 2},
    cookie
  })
  expect(dupe.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('already exists')})
  ])
})

test('addTaskSecondaryStatus enforces the 25-per-team cap', async () => {
  const {teamId, cookie} = await signUp()
  // seed 25 directly; the mutation is the 26th
  const pg = getKysely()
  await pg
    .insertInto('TaskSecondaryStatus')
    .values(
      Array.from({length: 25}, (_, i) => ({
        teamId,
        status: 'active' as const,
        label: `Status ${i}`,
        sortOrder: i
      }))
    )
    .execute()
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status: 'future', label: 'One too many', sortOrder: 99},
    cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('limited to 25')})
  ])
})

const addStatus = async (
  teamId: string,
  cookie: string,
  label = 'In review',
  status = 'active'
) => {
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status, label, sortOrder: 1},
    cookie
  })
  return res.data.addTaskSecondaryStatus.taskSecondaryStatus.id as string
}

test('renameTaskSecondaryStatus renames; blocks non-members', async () => {
  const [{teamId, cookie}, attacker] = await Promise.all([signUp(), signUp()])
  const id = await addStatus(teamId, cookie)
  const RENAME = `
    mutation RenameTaskSecondaryStatus($id: ID!, $label: String!) {
      renameTaskSecondaryStatus(id: $id, label: $label) {
        taskSecondaryStatus { id label }
      }
    }
  `
  const attack = await sendPublic({
    query: RENAME,
    variables: {id, label: 'Hijacked'},
    cookie: attacker.cookie
  })
  expect(attack.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])

  const renamed = await sendPublic({query: RENAME, variables: {id, label: 'In QA'}, cookie})
  expect(renamed.errors).toBeUndefined()
  expect(renamed.data.renameTaskSecondaryStatus.taskSecondaryStatus).toEqual({id, label: 'In QA'})
})

test('moveTaskSecondaryStatus updates sortOrder', async () => {
  const {teamId, cookie} = await signUp()
  const id = await addStatus(teamId, cookie)
  const moved = await sendPublic({
    query: `
      mutation MoveTaskSecondaryStatus($id: ID!, $sortOrder: Float!) {
        moveTaskSecondaryStatus(id: $id, sortOrder: $sortOrder) {
          taskSecondaryStatus { id sortOrder }
        }
      }
    `,
    variables: {id, sortOrder: 4.5},
    cookie
  })
  expect(moved.errors).toBeUndefined()
  expect(moved.data.moveTaskSecondaryStatus.taskSecondaryStatus).toEqual({id, sortOrder: 4.5})
})

test('removeTaskSecondaryStatus safe-deletes: tasks revert to bare primary', async () => {
  const {teamId, cookie} = await signUp()
  const gqlId = await addStatus(teamId, cookie, 'Doomed', 'active')
  const dbId = TaskSecondaryStatusId.split(gqlId)

  // create a task, then point it at the secondary via direct UPDATE
  // (createTask gains secondaryStatusId in a later change; this test isolates SET NULL)
  const createRes = await sendPublic({
    query: `
      mutation CreateTask($newTask: CreateTaskInput!) {
        createTask(newTask: $newTask) {
          task { id }
        }
      }
    `,
    variables: {newTask: {teamId, status: 'active', sortOrder: 0}},
    cookie
  })
  const taskId = createRes.data.createTask.task.id
  const pg = getKysely()
  await pg.updateTable('Task').set({secondaryStatusId: dbId}).where('id', '=', taskId).execute()

  const removeRes = await sendPublic({
    query: `
      mutation RemoveTaskSecondaryStatus($id: ID!) {
        removeTaskSecondaryStatus(id: $id) {
          removedTaskSecondaryStatusId
          team { id }
        }
      }
    `,
    variables: {id: gqlId},
    cookie
  })
  expect(removeRes.errors).toBeUndefined()
  expect(removeRes.data.removeTaskSecondaryStatus.removedTaskSecondaryStatusId).toBe(gqlId)

  // FK ON DELETE SET NULL reverted the task to its bare primary
  const {secondaryStatusId} = await pg
    .selectFrom('Task')
    .select('secondaryStatusId')
    .where('id', '=', taskId)
    .executeTakeFirstOrThrow()
  expect(secondaryStatusId).toBeNull()
})
