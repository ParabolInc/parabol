import {z} from 'zod'
import defineTool from '../defineTool'
import markdownToTaskContent from '../markdownToTaskContent'
import runGraphQL from '../runGraphQL'
import taskStatusSchema from '../taskStatusSchema'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!, $canReadTasks: Boolean!) {
    createTask(newTask: $newTask) {
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
  name: 'create_task',
  title: 'Create a task',
  description:
    'Create a task on a team, optionally assigned to a team member. It returns the new task id, and its text and status too when the connection has tasks:read. Needs tasks:write.',
  inputSchema: z.object({
    teamId: z.string().describe('The team the task belongs to, from get_me'),
    content: z.string().min(1).describe('What the task says, in markdown'),
    status: taskStatusSchema.default('active').describe('The task status'),
    userId: z
      .string()
      .optional()
      .describe('The team member to assign it to. Omit to leave it unassigned')
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, content, status, userId}) =>
    toolResult(
      await runGraphQL(context, CREATE_TASK, {
        newTask: {teamId, status, userId, content: markdownToTaskContent(content, 'task')},
        canReadTasks: context.grant.scopes.includes('tasks:read')
      })
    )
})
