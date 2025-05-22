import {sendPublic, signUp} from './common'

test('Unassigning a task causes a not-null constraint violation in Notification', async () => {
  // Sign up a user
  const {userId, authToken} = await signUp()

  // Create a task assigned to the user
  const createTask = await sendPublic({
    query: `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          task {
            id
            userId
          }
        }
      }
    `,
    variables: {
      input: {
        content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Test task"}]}]}',
        status: 'active',
        teamId: userId, // Using userId as teamId for simplicity
        userId: userId // Assign to self
      }
    },
    authToken
  })

  expect(createTask.data.createTask.task.id).toBeTruthy()
  expect(createTask.data.createTask.task.userId).toBe(userId)
  
  const taskId = createTask.data.createTask.task.id

  // Now attempt to unassign the task (set userId to null)
  // This should trigger the bug where a null userId is used in a notification
  const updateTask = await sendPublic({
    query: `
      mutation UpdateTask($updatedTask: UpdateTaskInput!) {
        updateTask(updatedTask: $updatedTask) {
          taskId
        }
      }
    `,
    variables: {
      updatedTask: {
        id: taskId,
        userId: null // Unassign the task
      }
    },
    authToken
  })

  // If the bug exists, this should fail with a constraint violation
  // If we see errors about a not-null constraint violation for the userId column in Notification, the bug exists
  expect(updateTask.errors).toBeTruthy()
  const errorMessage = updateTask.errors[0].message
  expect(errorMessage).toContain('violates not-null constraint')
  expect(errorMessage).toContain('column "userId" of relation "Notification"')
})
