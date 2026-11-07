import searchClickUpTasks from '../../../integrations/clickup/searchClickUpTasks'
import type {ClickUpIntegrationResolvers} from '../resolverTypes'

export type ClickUpIntegrationSource = {
  teamId: string
  userId: string
}

const MAX_TASKS = 100

const failedConnection = (error: Error) => ({
  edges: [],
  pageInfo: {hasNextPage: false, hasPreviousPage: false},
  error: {message: error.message}
})

const ClickUpIntegration: ClickUpIntegrationResolvers = {
  id: ({teamId, userId}) => `clickup:${teamId}:${userId}`,

  tasks: async ({teamId, userId}, args, context, info) => {
    const {first, after, queryString, listIds, assignedToViewer} = args
    const {updatedAfter, updatedBefore, includeClosed} = args
    const page = after ? Number(after) : 0
    if (!Number.isSafeInteger(page) || page < 0) {
      return failedConnection(new Error('Invalid cursor'))
    }
    const res = await searchClickUpTasks(
      {dataLoader: context.dataLoader, teamId, userId, context, info},
      {
        queryString: queryString?.trim() ?? '',
        listIds: listIds ?? [],
        assignedToViewer: !!assignedToViewer,
        updatedAfter: updatedAfter ?? null,
        updatedBefore: updatedBefore ?? null,
        includeClosed: !!includeClosed,
        page,
        minResults: Math.min(Math.max(first, 1), MAX_TASKS)
      }
    )
    if (res instanceof Error) return failedConnection(res)
    const endCursor = res.nextPage === null ? null : String(res.nextPage)
    return {
      edges: res.tasks.map((node) => ({node, cursor: endCursor})),
      pageInfo: {
        hasNextPage: res.nextPage !== null,
        hasPreviousPage: false,
        startCursor: after ?? null,
        endCursor
      }
    }
  }
}

export default ClickUpIntegration
