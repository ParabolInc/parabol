import {z} from 'zod'
import defineTool from '../defineTool'
import isScopeGranted from '../isScopeGranted'
import markdownToTaskContent from '../markdownToTaskContent'
import runGraphQL from '../runGraphQL'
import taskStatusSchema from '../taskStatusSchema'
import {withMarkdownContent} from '../tipTapContentToMarkdown'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const TASK_FIELDS = `
  task {
    id
    ... @include(if: $canReadTasks) {
      content
      plaintextContent
      status
      teamId
      userId
    }
  }
`

const UPDATE_TASK = `
  mutation UpdateTask($updatedTask: UpdateTaskInput!, $canReadTasks: Boolean!) {
    updateTask(updatedTask: $updatedTask) {
      ${TASK_FIELDS}
    }
  }
`

const CHANGE_TASK_TEAM = `
  mutation ChangeTaskTeam($taskId: ID!, $teamId: ID!, $canReadTasks: Boolean!) {
    changeTaskTeam(taskId: $taskId, teamId: $teamId) {
      ${TASK_FIELDS}
    }
  }
`

export default defineTool({
  name: 'update_task',
  title: 'Update a task',
  description:
    'Change what a task says, its status, who it is assigned to, or which team it is on. Content replaces the whole task. A move to another team happens first, so a new assignee must be on that team; if the move works and the other changes fail, the error carries movedToTeamId. It returns the task id, and its text as markdown and its status too when the connection has tasks:read. Needs tasks:write.',
  inputSchema: z.object({
    taskId: z.string().describe('The task id, from list_tasks or create_task'),
    content: z.string().min(1).optional().describe('The new task text, in markdown'),
    status: taskStatusSchema.optional().describe('The new status'),
    userId: z.string().optional().describe('The team member to assign it to'),
    teamId: z
      .string()
      .optional()
      .describe('The team to move it to, from get_me. Its assignee must be on that team too')
  }),
  annotations: writeAnnotations,
  run: async (context, {taskId, content, status, userId, teamId}) => {
    if (content === undefined && !status && !userId && !teamId) {
      return toolError('Pass content, status, userId or teamId to change.', 'BAD_USER_INPUT')
    }
    const canReadTasks = isScopeGranted(context, 'tasks:read')
    if (teamId) {
      const moved = await runGraphQL(context, CHANGE_TASK_TEAM, {taskId, teamId, canReadTasks})
      if (moved.errors?.length || (content === undefined && !status && !userId)) {
        return toolResult(withMarkdownContent(moved))
      }
    }
    const updated = await runGraphQL(context, UPDATE_TASK, {
      updatedTask: {
        id: taskId,
        status,
        userId,
        content: content === undefined ? undefined : markdownToTaskContent(content, 'task')
      },
      canReadTasks
    })
    return toolResult(
      withMarkdownContent(updated),
      teamId && updated.errors?.length ? {movedToTeamId: teamId} : undefined
    )
  }
})
