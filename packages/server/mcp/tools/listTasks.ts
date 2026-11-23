import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import taskStatusSchema from '../taskStatusSchema'
import {readAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const TASK_CONNECTION = `
  edges {
    node {
      id
      plaintextContent
      status
      teamId
      userId
      dueDate
      updatedAt
    }
  }
  pageInfo {
    hasNextPage
  }
`

const LIST_TASKS = `
  query ListTasks($first: Int!, $statusFilters: [TaskStatusEnum!]) {
    viewer {
      tasks(first: $first, statusFilters: $statusFilters, includeUnassigned: true) {
        ${TASK_CONNECTION}
      }
    }
  }
`

const LIST_TEAM_TASKS = `
  query ListTeamTasks($first: Int!, $teamId: ID!, $statusFilters: [TaskStatusEnum!]) {
    viewer {
      team(teamId: $teamId) {
        id
      }
      tasks(
        first: $first
        teamIds: [$teamId]
        statusFilters: $statusFilters
        includeUnassigned: true
      ) {
        ${TASK_CONNECTION}
      }
    }
  }
`

export default defineTool({
  name: 'list_tasks',
  title: 'List tasks',
  description:
    'List the tasks on your teams, assigned or not, most recently updated first. Filter by team or status. Needs users:read and tasks:read; the teamId filter also needs teams:read.',
  inputSchema: {
    teamId: z.string().optional().describe('Only list tasks of this team'),
    status: taskStatusSchema.optional().describe('Only list tasks with this status'),
    first: z.number().int().min(1).max(100).default(50).describe('Most tasks to return')
  },
  annotations: readAnnotations,
  run: async (context, {teamId, status, first}) => {
    const variables = {first, statusFilters: status ? [status] : null}
    return toolResult(
      teamId
        ? await runGraphQL(context, LIST_TEAM_TASKS, {...variables, teamId})
        : await runGraphQL(context, LIST_TASKS, variables)
    )
  }
})
