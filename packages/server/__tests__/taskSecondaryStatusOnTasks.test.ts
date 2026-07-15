import {sendPublic, signUp} from './common'

const ADD_STATUS = `
  mutation AddTaskSecondaryStatus($teamId: ID!, $status: TaskStatusEnum!, $label: String!, $sortOrder: Float!) {
    addTaskSecondaryStatus(teamId: $teamId, status: $status, label: $label, sortOrder: $sortOrder) {
      taskSecondaryStatus { id }
    }
  }
`

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      error { message }
      task {
        id
        status
        secondaryStatus { id label }
        user { id }
      }
    }
  }
`

const addStatus = async (teamId: string, cookie: string, label: string, status: string) => {
  const res = await sendPublic({
    query: ADD_STATUS,
    variables: {teamId, status, label, sortOrder: 1},
    cookie
  })
  return res.data.addTaskSecondaryStatus.taskSecondaryStatus.id as string
}

test('createTask with a valid secondaryStatusId', async () => {
  const {teamId, cookie} = await signUp()
  const secondaryId = await addStatus(teamId, cookie, 'In review', 'active')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {teamId, status: 'active', sortOrder: 0, secondaryStatusId: secondaryId}
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.createTask.task.secondaryStatus).toEqual({id: secondaryId, label: 'In review'})
})

test('createTask rejects a secondary nested under a different primary', async () => {
  const {teamId, cookie} = await signUp()
  const secondaryId = await addStatus(teamId, cookie, 'Blocked', 'stuck')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {teamId, status: 'active', sortOrder: 0, secondaryStatusId: secondaryId}
    },
    cookie
  })
  expect(res.data.createTask.error.message).toMatch('different primary status')
})

test("createTask rejects another team's secondary", async () => {
  const [alice, bob] = await Promise.all([signUp(), signUp()])
  const bobSecondary = await addStatus(bob.teamId, bob.cookie, 'In review', 'active')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {
        teamId: alice.teamId,
        status: 'active',
        sortOrder: 0,
        secondaryStatusId: bobSecondary
      }
    },
    cookie: alice.cookie
  })
  expect(res.data.createTask.error.message).toMatch('different team')
})

const UPDATE_TASK = `
  mutation UpdateTask($updatedTask: UpdateTaskInput!) {
    updateTask(updatedTask: $updatedTask) {
      error { message }
      task {
        id
        status
        secondaryStatus { id }
        user { id }
      }
    }
  }
`

const createTaskWithSecondary = async () => {
  const {userId, teamId, orgId, cookie} = await signUp()
  const secondaryId = await addStatus(teamId, cookie, 'In review', 'active')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {teamId, status: 'active', sortOrder: 0, secondaryStatusId: secondaryId, userId}
    },
    cookie
  })
  const taskId = res.data.createTask.task.id as string
  return {userId, teamId, orgId, cookie, secondaryId, taskId}
}

test('updateTask sets and clears secondaryStatusId', async () => {
  const {cookie, taskId, secondaryId} = await createTaskWithSecondary()
  // explicit null clears
  const cleared = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, secondaryStatusId: null}},
    cookie
  })
  expect(cleared.data.updateTask.task.secondaryStatus).toBeNull()
  // set it back
  const setAgain = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, secondaryStatusId: secondaryId}},
    cookie
  })
  expect(setAgain.data.updateTask.task.secondaryStatus).toEqual({id: secondaryId})
})

test('updateTask auto-clears secondary when primary status changes', async () => {
  const {cookie, taskId} = await createTaskWithSecondary()
  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, status: 'done'}},
    cookie
  })
  expect(res.data.updateTask.task).toMatchObject({status: 'done', secondaryStatus: null})
})

test('updateTask rejects a secondary that mismatches the new primary', async () => {
  const {cookie, taskId, secondaryId} = await createTaskWithSecondary()
  // secondary is nested under active; moving to done while keeping it must fail
  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, status: 'done', secondaryStatusId: secondaryId}},
    cookie
  })
  expect(res.data.updateTask.error.message).toMatch('different primary status')
})

test('updateTask userId: null unassigns (bug fix)', async () => {
  const {cookie, taskId, userId} = await createTaskWithSecondary()
  // sanity: currently assigned
  const before = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, sortOrder: 1}},
    cookie
  })
  expect(before.data.updateTask.task.user).toEqual({id: userId})
  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, userId: null}},
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.updateTask.task.user).toBeNull()
})
