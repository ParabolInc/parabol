import loadServiceRepoIntegrations from '../loadServiceRepoIntegrations'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import type {ClickUpApiTask} from './ClickUpApiTypes'
import clickUpRequest, {ClickUpNotFoundError, type ClickUpRequestAuth} from './clickUpRequest'
import listClickUpWorkspaces from './listClickUpWorkspaces'
import mapClickUpTask, {type ClickUpTaskSource} from './mapClickUpTask'

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

interface TaskLookup {
  taskId: string
  isCustomId: boolean
  workspaceId: string | null
  isPastedLink: boolean
}

const PAGE_SIZE = 100
const MAX_TEXT_SEARCH_PAGES = 3
const NEWEST_UPDATED_FIRST = {order_by: 'updated'}
const TASK_LINK = /^(?:https?:\/\/)?app\.clickup\.com\/t\/(?:(\d+)\/)?([^/?#\s]+)\/?(?:[?#]\S*)?$/i
const CUSTOM_ID = /^[A-Z][A-Z0-9]*-\d+$/
const TASK_ID = /^[a-z0-9]+$/i
const TYPED_TASK_ID = /^(?=[a-z]*\d)[a-z0-9]+$/

const readTaskLookup = (queryString: string): TaskLookup | null => {
  const link = TASK_LINK.exec(queryString)
  if (link) {
    const [, workspaceId = null, taskId = ''] = link
    if (workspaceId && CUSTOM_ID.test(taskId)) {
      return {taskId, isCustomId: true, workspaceId, isPastedLink: true}
    }
    return TASK_ID.test(taskId)
      ? {taskId, isCustomId: false, workspaceId: null, isPastedLink: true}
      : null
  }
  if (CUSTOM_ID.test(queryString)) {
    return {taskId: queryString, isCustomId: true, workspaceId: null, isPastedLink: false}
  }
  return TYPED_TASK_ID.test(queryString)
    ? {taskId: queryString, isCustomId: false, workspaceId: null, isPastedLink: false}
    : null
}

const lookUpTask = async (
  auth: ClickUpRequestAuth,
  {taskId, isCustomId, workspaceId, isPastedLink}: TaskLookup,
  workspaces: SearchedWorkspace[]
) => {
  const workspaceIds = workspaceId ? [workspaceId] : workspaces.map((ws) => ws.workspaceId)
  const queries = isCustomId
    ? workspaceIds.map((team_id) => ({custom_task_ids: true, team_id}))
    : [{}]
  const tasks = await Promise.all(
    queries.map((query) =>
      clickUpRequest<ClickUpApiTask>(auth, `/task/${encodeURIComponent(taskId)}`, {
        query: {...query, include_markdown_description: true}
      })
    )
  )
  const failure =
    isPastedLink &&
    tasks.find(
      (task): task is Error => task instanceof Error && !(task instanceof ClickUpNotFoundError)
    )
  if (failure) return failure
  return tasks.flatMap((task) => (task instanceof Error ? [] : [mapClickUpTask(task)]))
}

const listSearchedWorkspaces = async (
  ctx: GqlIntegrationCtx,
  auth: ClickUpRequestAuth,
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
  if (workspaces.length === 0) return {tasks: [], nextPage: null}

  const lookup = readTaskLookup(queryString)
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
          clickUpRequest<{tasks?: ClickUpApiTask[]}>(
            auth,
            `/team/${encodeURIComponent(workspaceId)}/task`,
            {workspaceId, query: {page: nextPage, ...filters, list_ids: listIds}}
          )
        )
      )
      const taskPages: ClickUpApiTask[][] = []
      for (const response of responses) {
        if (response instanceof Error) return response
        taskPages.push(response.tasks ?? [])
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
