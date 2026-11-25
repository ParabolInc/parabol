import {z} from 'zod'
import defineTool from '../defineTool'
import ensureMeetingMember from '../ensureMeetingMember'
import isScopeGranted from '../isScopeGranted'
import markdownToTaskContent from '../markdownToTaskContent'
import runGraphQL from '../runGraphQL'
import taskStatusSchema from '../taskStatusSchema'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
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
    "Create a task on a team, optionally assigned to a team member. With meetingId the task is made in that meeting and shows in its summary, joining the meeting first if you haven't; add discussionId to put it at the end of one of the meeting's discussions, from list_discussions for a retrospective or check-in, or from get_standup, get_poker_meeting or get_team_health_meeting. It returns the new task id, and its text and status too when the connection has tasks:read. It refuses a discussionId without its meetingId, a discussion from another meeting or team, a meeting that ended before you joined it, and one on a team you aren't on. Needs tasks:write, and meetings:write with meetingId.",
  inputSchema: z.object({
    teamId: z.string().describe('The team the task belongs to, from get_me'),
    content: z.string().min(1).describe('What the task says, in markdown'),
    status: taskStatusSchema.default('active').describe('The task status'),
    userId: z
      .string()
      .optional()
      .describe('The team member to assign it to. Omit to leave it unassigned'),
    meetingId: z
      .string()
      .optional()
      .describe("A meeting of the team's to make the task in, from list_meetings"),
    discussionId: z.string().optional().describe('A discussion in that meeting to add the task to')
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, content, status, userId, meetingId, discussionId}) => {
    if (discussionId && !meetingId) {
      return toolError('Pass the meetingId of the discussion too.', 'BAD_USER_INPUT')
    }
    if (meetingId) {
      const notJoined = await ensureMeetingMember(context, meetingId)
      if (notJoined) return notJoined
    }
    return toolResult(
      await runGraphQL(context, CREATE_TASK, {
        newTask: {
          teamId,
          status,
          userId,
          meetingId,
          discussionId,
          content: markdownToTaskContent(content, 'task')
        },
        canReadTasks: isScopeGranted(context, 'tasks:read')
      })
    )
  }
})
