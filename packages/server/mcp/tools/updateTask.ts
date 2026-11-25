import {z} from 'zod'
import defineTool from '../defineTool'
import isScopeGranted from '../isScopeGranted'
import markdownToTaskContent from '../markdownToTaskContent'
import runGraphQL from '../runGraphQL'
import taskStatusSchema from '../taskStatusSchema'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const UPDATE_TASK = `
  mutation UpdateTask($updatedTask: UpdateTaskInput!, $canReadTasks: Boolean!) {
    updateTask(updatedTask: $updatedTask) {
      task {
        id
        ... @include(if: $canReadTasks) {
          plaintextContent
          status
          teamId
          userId
        }
      }
    }
  }
`

export default defineTool({
  name: 'update_task',
  title: 'Update a task',
  description:
    'Change what a task says, its status, or who it is assigned to. Content replaces the whole task. It returns the task id, and its text and status too when the connection has tasks:read. Needs tasks:write.',
  inputSchema: z.object({
    taskId: z.string().describe('The task id, from list_tasks or create_task'),
    content: z.string().min(1).optional().describe('The new task text, in markdown'),
    status: taskStatusSchema.optional().describe('The new status'),
    userId: z.string().optional().describe('The team member to assign it to')
  }),
  annotations: writeAnnotations,
  run: async (context, {taskId, content, status, userId}) => {
    if (content === undefined && !status && !userId) {
      return toolError('Pass content, status or userId to change.', 'BAD_USER_INPUT')
    }
    return toolResult(
      await runGraphQL(context, UPDATE_TASK, {
        updatedTask: {
          id: taskId,
          status,
          userId,
          content: content === undefined ? undefined : markdownToTaskContent(content, 'task')
        },
        canReadTasks: isScopeGranted(context, 'tasks:read')
      })
    )
  }
})
