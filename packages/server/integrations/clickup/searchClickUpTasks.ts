import ms from 'ms'
import readClickUpTaskLookup, {
  type ClickUpTaskLookup
} from 'parabol-client/integrations/clickup/shared/readClickUpTaskLookup'
import loadServiceRepoIntegrations from '../loadServiceRepoIntegrations'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import type {ClickUpApiTask} from './ClickUpApiTypes'
import {ClickUpNotFoundError} from './clickUpRequest'
import fetchClickUpTask from './fetchClickUpTask'
import listClickUpWorkspaces from './listClickUpWorkspaces'
import mapClickUpTask, {type ClickUpTaskSource} from './mapClickUpTask'
import readClickUpCached, {type ClickUpCacheAuth} from './readClickUpCached'

interface SearchParams {
  queryString: string
  listIds: string[]
  assignedToViewer: boolean
  updatedAfter: Date | null
  updatedBefore: Date | null
  includeClosed: boolean
  page: number
  minResults: number
}

interface SearchedWorkspace {
  workspaceId: string
  listIds: string[]
}

const PAGE_SIZE = 100
const TASK_PAGE_MAX_AGE = ms('30s')
const MAX_TEXT_SEARCH_PAGES = 3
const NEWEST_UPDATED_FIRST = {order_by: 'updated'}

const lookUpTask = async (
  auth: ClickUpCacheAuth,
  {taskId, isCustomId, workspaceId, isPastedLink}: ClickUpTaskLookup,
  workspaces: SearchedWorkspace[]
) => {
  const workspaceIds = workspaceId ? [workspaceId] : workspaces.map((ws) => ws.workspaceId)
  const customIdWorkspaceIds: Array<string | null> = isCustomId ? workspaceIds : [null]
  const tasks = await Promise.all(
    customIdWorkspaceIds.map((customIdWorkspaceId) =>
      fetchClickUpTask(auth, taskId, customIdWorkspaceId)
    )
  )
  const failure =
    isPastedLink &&
    tasks.find(
      (task): task is Error => task instanceof Error && !(task instanceof ClickUpNotFoundError)
    )
  if (failure) return failure
  return tasks.filter((task): task is ClickUpTaskSource => !(task instanceof Error))
}

const listSearchedWorkspaces = async (
  ctx: GqlIntegrationCtx,
  auth: ClickUpCacheAuth,
  listIds: string[]
): Promise<SearchedWorkspace[] | Error> => {
  if (listIds.length === 0) {
    const workspaces = await listClickUpWorkspaces(auth)
    if (workspaces instanceof Error) return workspaces
    return workspaces.map(({id}) => ({workspaceId: id, listIds: []}))
  }
  const repos = await loadServiceRepoIntegrations('clickup', ctx)
  if (!repos) return new Error('Could not read your ClickUp lists. Try again, or reconnect ClickUp')
  const workspaceIdByListId = new Map(
    repos.flatMap((repo) => (repo.service === 'clickup' ? [[repo.id, repo.workspaceId]] : []))
  )
  const listIdsByWorkspaceId = new Map<string, string[]>()
  listIds.forEach((listId) => {
    const workspaceId = workspaceIdByListId.get(listId)
    if (!workspaceId) return
    listIdsByWorkspaceId.set(workspaceId, [
      ...(listIdsByWorkspaceId.get(workspaceId) ?? []),
      listId
    ])
  })
  if (listIdsByWorkspaceId.size === 0) {
    return new Error(
      'The selected ClickUp lists are no longer available. Clear them from the list filter'
    )
  }
  return [...listIdsByWorkspaceId].map(([workspaceId, listIds]) => ({workspaceId, listIds}))
}

const searchClickUpTasks = async (
  ctx: GqlIntegrationCtx,
  params: SearchParams
): Promise<{tasks: ClickUpTaskSource[]; nextPage: number | null} | Error> => {
  const {dataLoader, teamId, userId} = ctx
  const {
    queryString,
    listIds,
    assignedToViewer,
    updatedAfter,
    updatedBefore,
    includeClosed,
    page,
    minResults
  } = params
  const auth = await dataLoader.get('freshAuth').load({service: 'clickup', teamId, userId})
  if (!auth?.accessToken) return new Error('ClickUp is not connected. Reconnect it and try again')
  const {providerUserId} = auth
  if (assignedToViewer && !providerUserId) {
    return new Error('Reconnect ClickUp so Parabol can find the tasks assigned to you')
  }
  const workspaces = await listSearchedWorkspaces(ctx, auth, listIds)
  if (workspaces instanceof Error) return workspaces

  const lookup = readClickUpTaskLookup(queryString)
  const needle = (lookup?.taskId ?? queryString).toLowerCase()
  const isMatch = ({name, custom_id, id}: ClickUpApiTask) =>
    !needle || [name, custom_id, id].some((value) => value?.toLowerCase().includes(needle))
  const filters = {
    ...NEWEST_UPDATED_FIRST,
    subtasks: true,
    include_markdown_description: true,
    include_closed: includeClosed,
    assignees: assignedToViewer && providerUserId ? [providerUserId] : [],
    date_updated_gt: updatedAfter?.getTime(),
    date_updated_lt: updatedBefore?.getTime()
  }
  const lastPage = page + (needle ? MAX_TEXT_SEARCH_PAGES : 1) - 1

  const scanPages = async () => {
    const matches: ClickUpApiTask[] = []
    let fullWorkspaces = workspaces
    let nextPage = page
    do {
      const responses = await Promise.all(
        fullWorkspaces.map(({workspaceId, listIds}) =>
          readClickUpCached<{tasks?: ClickUpApiTask[]}, ClickUpApiTask[]>(
            auth,
            `/team/${encodeURIComponent(workspaceId)}/task`,
            {workspaceId, query: {page: nextPage, ...filters, list_ids: listIds}},
            TASK_PAGE_MAX_AGE,
            ({tasks = []}) => tasks
          )
        )
      )
      const taskPages: ClickUpApiTask[][] = []
      for (const response of responses) {
        if (response instanceof Error) return response
        taskPages.push(response)
      }
      matches.push(...taskPages.flat().filter(isMatch))
      fullWorkspaces = fullWorkspaces.filter((_, idx) => taskPages[idx]!.length >= PAGE_SIZE)
      nextPage++
    } while (fullWorkspaces.length > 0 && nextPage <= lastPage && matches.length < minResults)
    return {matches, nextPage: fullWorkspaces.length > 0 ? nextPage : null}
  }

  const [exactTasks, scan] = await Promise.all([
    lookup && page === 0 ? lookUpTask(auth, lookup, workspaces) : [],
    scanPages()
  ])
  if (exactTasks instanceof Error) return exactTasks
  if (scan instanceof Error) return scan
  const scannedTasks = scan.matches
    .map(mapClickUpTask)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  const seenIds = new Set<string>()
  const tasks = [...exactTasks, ...scannedTasks].filter(({id}) => {
    if (seenIds.has(id)) return false
    seenIds.add(id)
    return true
  })
  return {tasks, nextPage: scan.nextPage}
}

export default searchClickUpTasks
