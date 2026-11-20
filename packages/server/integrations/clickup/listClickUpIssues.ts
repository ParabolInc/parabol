import {Logger} from '../../utils/Logger'
import type {InspirationIssue, IssuePage} from '../platform/InspirationIssue'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import searchClickUpTasks from './searchClickUpTasks'

const isOptionalDate = (value: unknown) =>
  value === undefined || (typeof value === 'string' && !Number.isNaN(new Date(value).getTime()))

const parseSearchQuery = (searchQuery: string) => {
  try {
    const {startAt, endAt, listIds} = JSON.parse(searchQuery)
    if (!isOptionalDate(startAt) || !isOptionalDate(endAt)) return null
    return {
      updatedAfter: startAt === undefined ? null : new Date(startAt),
      updatedBefore: endAt === undefined ? null : new Date(endAt),
      listIds: Array.isArray(listIds)
        ? listIds.filter((id): id is string => typeof id === 'string')
        : []
    }
  } catch {
    return null
  }
}

const listClickUpIssues = async (
  ctx: GqlIntegrationCtx,
  searchQuery: string,
  {before, first}: IssuePage
): Promise<InspirationIssue[]> => {
  const params = parseSearchQuery(searchQuery)
  if (!params) {
    Logger.error('listClickUpIssues: could not parse searchQuery')
    return []
  }
  const {updatedBefore} = params
  const res = await searchClickUpTasks(ctx, {
    ...params,
    updatedBefore: before && (!updatedBefore || before < updatedBefore) ? before : updatedBefore,
    queryString: '',
    assignedToViewer: true,
    includeClosed: true,
    page: 0,
    minResults: first
  })
  if (res instanceof Error) {
    Logger.error(res.message)
    return []
  }
  return res.tasks.slice(0, first).map(
    (task): InspirationIssue => ({
      kind: 'Task',
      title: task.title,
      reference: task.customId ?? task.taskId,
      subtitle: [task.folderName, task.listName].filter(Boolean).join(' / '),
      status: task.status.name,
      url: task.url,
      updatedAt: task.updatedAt,
      description: task.description,
      isOwnWork: true,
      isClosed: task.status.type === 'closed' || task.status.type === 'done'
    })
  )
}

export default listClickUpIssues
