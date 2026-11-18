import {GraphQLError} from 'graphql'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import toCodedIntegrationError from '../platform/toCodedIntegrationError'
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
}

const MAX_TASKS = 100

const makeClickUpTaskConnection = async (
  ctx: GqlIntegrationCtx,
  args: ClickUpTasksArgs
): Promise<ClickUpTaskConnection> => {
  const {first, after, queryString, listIds, assignedToViewer} = args
  const {updatedAfter, updatedBefore, includeClosed} = args
  const page = after ? Number(after) : 0
  if (!Number.isSafeInteger(page) || page < 0) {
    throw new GraphQLError('Invalid cursor', {extensions: {code: 'BAD_USER_INPUT'}})
  }
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
  if (res instanceof Error) throw toCodedIntegrationError(res)
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
