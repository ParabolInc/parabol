import {Logger} from '../../utils/Logger'
import {type InspirationIssue, MAX_ISSUES} from '../platform/InspirationIssue'
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
  searchQuery: string
): Promise<InspirationIssue[]> => {
  const params = parseSearchQuery(searchQuery)
  if (!params) {
    Logger.error('listClickUpIssues: could not parse searchQuery')
    return []
  }
  const res = await searchClickUpTasks(ctx, {
    ...params,
    queryString: '',
    assignedToViewer: true,
    includeClosed: true,
    page: 0,
    minResults: MAX_ISSUES
  })
  if (res instanceof Error) {
    Logger.error(res.message)
    return []
  }
  return res.tasks.slice(0, MAX_ISSUES).map(
    (task): InspirationIssue => ({
      kind: 'Task',
      title: task.title,
      reference: task.customId ?? task.taskId,
      subtitle: [task.folderName, task.listName].filter(Boolean).join(' / '),
      status: task.status.name,
      url: task.url,
      updatedAt: task.updatedAt,
      description: task.description
    })
  )
}

export default listClickUpIssues
