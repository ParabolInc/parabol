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
