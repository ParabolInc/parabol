import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import type {ClickUpTaskSource} from './mapClickUpTask'
import searchClickUpTasks from './searchClickUpTasks'

interface ClickUpTasksArgs {
  first: number
  after?: string | null
  queryString?: string | null
  listIds?: readonly string[] | null
  assignedToViewer?: boolean | null
  updatedAfter?: Date | null
  updatedBefore?: Date | null
  includeClosed?: boolean | null
}

interface ClickUpTaskConnection {
  edges: {node: ClickUpTaskSource; cursor: string | null}[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string | null
    endCursor?: string | null
  }
  error?: {message: string}
}

const MAX_TASKS = 100

const makeFailedConnection = (error: Error): ClickUpTaskConnection => ({
  edges: [],
  pageInfo: {hasNextPage: false, hasPreviousPage: false},
  error: {message: error.message}
})

const makeClickUpTaskConnection = async (
  ctx: GqlIntegrationCtx,
  args: ClickUpTasksArgs
): Promise<ClickUpTaskConnection> => {
  const {first, after, queryString, listIds, assignedToViewer} = args
  const {updatedAfter, updatedBefore, includeClosed} = args
  const page = after ? Number(after) : 0
  if (!Number.isSafeInteger(page) || page < 0)
    return makeFailedConnection(new Error('Invalid cursor'))
  const res = await searchClickUpTasks(ctx, {
    queryString: queryString?.trim() ?? '',
    listIds: listIds ? [...listIds] : [],
    assignedToViewer: !!assignedToViewer,
    updatedAfter: updatedAfter ?? null,
    updatedBefore: updatedBefore ?? null,
    includeClosed: !!includeClosed,
    page,
    minResults: Math.min(Math.max(first, 1), MAX_TASKS)
  })
  if (res instanceof Error) return makeFailedConnection(res)
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

export default makeClickUpTaskConnection
