jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../loadServiceRepoIntegrations', () => ({__esModule: true, default: jest.fn()}))

import {fetch, Response} from '@whatwg-node/fetch'
import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import loadServiceRepoIntegrations from '../../loadServiceRepoIntegrations'
import type {GqlIntegrationCtx} from '../../platform/ServerIntegrationDefinition'
import type {ClickUpApiTask} from '../ClickUpApiTypes'
import type {ClickUpRepo} from '../fetchClickUpRepos'
import searchClickUpTasks from '../searchClickUpTasks'

const mockFetch = jest.mocked(fetch)
const mockLoadRepos = jest.mocked(loadServiceRepoIntegrations)

const API_PATH = '/api/v2'
const PAGE_SIZE = 100

const auth = {
  accessToken: 'tok',
  userId: 'user1',
  teamId: 'team1',
  providerId: 7,
  providerUserId: '42'
}

const ctx = {
  teamId: 'team1',
  userId: 'user1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo,
  dataLoader: {
    get: (name: string) => {
      if (name === 'freshAuth') return {load: async () => auth}
      throw new Error(`Unexpected loader ${name}`)
    }
  }
} as unknown as GqlIntegrationCtx

const params = {
  queryString: '',
  listIds: [],
  assignedToViewer: false,
  updatedAfter: null,
  updatedBefore: null,
  includeClosed: false,
  page: 0,
  minResults: 50
}

const apiTask = (
  id: string,
  name: string,
  dateUpdated: number,
  workspaceId = '1',
  customId: string | null = null
): ClickUpApiTask => ({
  id,
  custom_id: customId,
  custom_item_id: null,
  name,
  markdown_description: '',
  status: {status: 'to do', color: '#d3d3d3', type: 'open'},
  date_updated: String(dateUpdated),
  url: `https://app.clickup.com/t/${id}`,
  team_id: workspaceId,
  list: {id: '1000', name: 'Sprint 1'},
  folder: {id: '100', name: 'Q4'},
  space: {id: '10'}
})

const chores = (workspaceId: string, page: number, count = PAGE_SIZE) =>
  Array.from({length: count}, (_, i) =>
    apiTask(`w${workspaceId}p${page}t${i}`, `Chore ${i}`, 1000 + i, workspaceId)
  )

const repo = (id: string, workspaceId: string): ClickUpRepo => ({
  service: 'clickup',
  id,
  workspaceId,
  name: `List ${id}`
})

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

type Route = (path: string, query: URLSearchParams) => unknown

const serve = (route: Route) => {
  mockFetch.mockImplementation(async (input) => {
    const url = new URL(String(input))
    const body = route(url.pathname.slice(API_PATH.length), url.searchParams)
    if (body === undefined) return jsonResponse({err: 'Task not found', ECODE: 'ITEM_013'}, 404)
    return body instanceof Response ? body : jsonResponse(body)
  })
}

const workspaces =
  (pagesByWorkspace: Record<string, ClickUpApiTask[][]>): Route =>
  (path, query) => {
    if (path === '/team') {
      return {teams: Object.keys(pagesByWorkspace).map((id) => ({id, name: `Workspace ${id}`}))}
    }
    const workspaceId = /^\/team\/(\d+)\/task$/.exec(path)?.[1]
    if (!workspaceId) return undefined
    return {tasks: pagesByWorkspace[workspaceId]?.[Number(query.get('page'))] ?? []}
  }

const requestedUrls = () => mockFetch.mock.calls.map(([input]) => new URL(String(input)))
const taskPageUrls = () =>
  requestedUrls().filter(({pathname}) => /\/team\/\d+\/task$/.test(pathname))
const lookupUrls = () => requestedUrls().filter(({pathname}) => pathname.includes('/task/'))
const scannedPages = () =>
  taskPageUrls().map((url) => `${url.pathname.split('/')[4]}:${url.searchParams.get('page')}`)

const searchTasks = async (overrides: Partial<Parameters<typeof searchClickUpTasks>[1]>) => {
  const res = await searchClickUpTasks(ctx, {...params, ...overrides})
  if (res instanceof Error) throw res
  return res
}

beforeEach(() => {
  mockFetch.mockReset()
  mockLoadRepos.mockReset()
})

test('searchClickUpTasks scans one page per workspace for an empty query', async () => {
  serve(
    workspaces({
      '1': [chores('1', 0), chores('1', 1)],
      '2': [chores('2', 0), chores('2', 1)]
    })
  )
  const res = await searchTasks({})
  expect(scannedPages()).toEqual(['1:0', '2:0'])
  expect(Object.fromEntries(taskPageUrls()[0]!.searchParams)).toEqual({
    page: '0',
    order_by: 'updated',
    subtasks: 'true',
    include_markdown_description: 'true',
    include_closed: 'false'
  })
  expect(res.tasks).toHaveLength(2 * PAGE_SIZE)
  const updatedTimes = res.tasks.map(({updatedAt}) => updatedAt.getTime())
  expect(updatedTimes).toEqual([...updatedTimes].sort((a, b) => b - a))
  expect(res.nextPage).toBe(1)
})

test('searchClickUpTasks matches "login" against names in up to 3 pages, ignoring case', async () => {
  const pageWithOneMatch = (page: number) => [
    ...chores('1', page, PAGE_SIZE - 1),
    apiTask(`m${page}`, `Fix LOGIN on page ${page}`, 500 - page)
  ]
  serve(workspaces({'1': [0, 1, 2, 3].map(pageWithOneMatch)}))
  const res = await searchTasks({queryString: 'login'})
  expect(scannedPages()).toEqual(['1:0', '1:1', '1:2'])
  expect(res.tasks.map(({title}) => title)).toEqual([
    'Fix LOGIN on page 0',
    'Fix LOGIN on page 1',
    'Fix LOGIN on page 2'
  ])
  expect(res.nextPage).toBe(3)
})

test('searchClickUpTasks stops scanning once minResults tasks match', async () => {
  serve(
    workspaces({
      '1': [
        [
          ...chores('1', 0, PAGE_SIZE - 2),
          apiTask('a1', 'Login page', 3000),
          apiTask('a2', 'SSO login', 2000)
        ],
        chores('1', 1)
      ]
    })
  )
  const res = await searchTasks({queryString: 'login', minResults: 2})
  expect(scannedPages()).toEqual(['1:0'])
  expect(res.tasks.map(({title}) => title)).toEqual(['Login page', 'SSO login'])
  expect(res.nextPage).toBe(1)
})

test('searchClickUpTasks matches custom ids and task ids too', async () => {
  serve(
    workspaces({
      '1': [[apiTask('86xyz', 'Chore', 2, '1', 'ENG-12'), apiTask('x1', 'Chore', 3, '1', 'OPS-9')]]
    })
  )
  const byCustomId = await searchTasks({queryString: 'eng-1'})
  expect(byCustomId.tasks.map(({taskId}) => taskId)).toEqual(['86xyz'])
  const byTaskId = await searchTasks({queryString: '86xy'})
  expect(byTaskId.tasks.map(({taskId}) => taskId)).toEqual(['86xyz'])
})

test('searchClickUpTasks looks a task link up exactly and lists that task first, once', async () => {
  const linked = apiTask('86abc', 'Old task', 100)
  const scan = workspaces({
    '1': [[apiTask('86abcd', 'Newer task', 900), linked, apiTask('x1', 'Other', 950)]]
  })
  serve((path, query) => (path === '/task/86abc' ? linked : scan(path, query)))
  const res = await searchTasks({queryString: 'https://app.clickup.com/t/86abc'})
  expect(lookupUrls().map(String)).toEqual([
    'https://api.clickup.com/api/v2/task/86abc?include_markdown_description=true'
  ])
  expect(res.tasks.map(({taskId}) => taskId)).toEqual(['86abc', '86abcd'])
  expect(res.tasks[0]).toMatchObject({
    service: 'clickup',
    id: '1::86abc',
    title: 'Old task',
    url: 'https://app.clickup.com/t/86abc'
  })
})

test('searchClickUpTasks looks a task up only for the first page', async () => {
  serve(workspaces({'1': [[], [], [], []]}))
  await searchTasks({queryString: 'https://app.clickup.com/t/86abc', page: 3})
  expect(lookupUrls()).toEqual([])
  expect(scannedPages()).toEqual(['1:3'])
})

test('searchClickUpTasks looks ENG-12 up as a custom id in each workspace', async () => {
  const customTask = apiTask('86eng', 'Billing export', 10, '2', 'ENG-12')
  const scan = workspaces({'1': [[]], '2': [[]]})
  serve((path, query) => {
    if (path !== '/task/ENG-12') return scan(path, query)
    return query.get('team_id') === '2' ? customTask : undefined
  })
  const res = await searchTasks({queryString: 'ENG-12'})
  expect(
    lookupUrls().map(({pathname, searchParams}) => [pathname, Object.fromEntries(searchParams)])
  ).toEqual([
    [
      '/api/v2/task/ENG-12',
      {custom_task_ids: 'true', team_id: '1', include_markdown_description: 'true'}
    ],
    [
      '/api/v2/task/ENG-12',
      {custom_task_ids: 'true', team_id: '2', include_markdown_description: 'true'}
    ]
  ])
  expect(res.tasks.map(({id}) => id)).toEqual(['2::86eng'])
})

test.each([
  [
    'https://app.clickup.com/t/9012345/ENG-12',
    '/task/ENG-12',
    jsonResponse({err: 'Team not authorized', ECODE: 'OAUTH_027'}, 401),
    'ClickUp workspace 9012345 is not shared with Parabol. Reconnect ClickUp and select it'
  ],
  [
    'https://app.clickup.com/t/86abc',
    '/task/86abc',
    new Response('<html>503</html>', {status: 503, headers: {'content-type': 'text/html'}}),
    'ClickUp returned an unexpected response (503)'
  ]
])(
  'searchClickUpTasks returns the Error when looking up %s fails',
  async (queryString, taskPath, failure, message) => {
    const scan = workspaces({'1': [[apiTask('t1', 'Chore', 1)]]})
    serve((path, query) => (path === taskPath ? failure : scan(path, query)))
    const res = await searchClickUpTasks(ctx, {...params, queryString})
    expect(lookupUrls().map(({pathname}) => pathname)).toEqual([`/api/v2${taskPath}`])
    expect(res).toBeInstanceOf(Error)
    expect(res).toMatchObject({message})
  }
)

test('searchClickUpTasks keeps the scan when looking up a typed id fails', async () => {
  const scan = workspaces({'1': [[apiTask('t1', 'Plan Q4 launch', 1), apiTask('t2', 'Chore', 2)]]})
  serve((path, query) =>
    path === '/task/q4'
      ? jsonResponse({err: 'Team not authorized', ECODE: 'OAUTH_027'}, 401)
      : scan(path, query)
  )
  const res = await searchTasks({queryString: 'q4'})
  expect(lookupUrls().map(({pathname}) => pathname)).toEqual(['/api/v2/task/q4'])
  expect(res.tasks.map(({title}) => title)).toEqual(['Plan Q4 launch'])
})

test('searchClickUpTasks keeps a typed custom id found in one workspace when another fails', async () => {
  const customTask = apiTask('86eng', 'Billing export', 10, '2', 'ENG-12')
  const scan = workspaces({'1': [[]], '2': [[]]})
  serve((path, query) => {
    if (path !== '/task/ENG-12') return scan(path, query)
    return query.get('team_id') === '2'
      ? customTask
      : new Response('<html>503</html>', {status: 503, headers: {'content-type': 'text/html'}})
  })
  const res = await searchTasks({queryString: 'ENG-12'})
  expect(lookupUrls()).toHaveLength(2)
  expect(res.tasks.map(({id}) => id)).toEqual(['2::86eng'])
})

test("searchClickUpTasks sends assignees[] with the viewer's ClickUp user id", async () => {
  serve(workspaces({'1': [[]]}))
  await searchTasks({assignedToViewer: true})
  expect(taskPageUrls()[0]!.searchParams.getAll('assignees[]')).toEqual(['42'])
})

test('searchClickUpTasks sends the update window in ms and include_closed', async () => {
  serve(workspaces({'1': [[]]}))
  const updatedAfter = new Date('2026-11-01T00:00:00Z')
  const updatedBefore = new Date('2026-11-07T00:00:00Z')
  await searchTasks({updatedAfter, updatedBefore, includeClosed: true})
  const {searchParams} = taskPageUrls()[0]!
  expect(searchParams.get('date_updated_gt')).toBe(String(updatedAfter.getTime()))
  expect(searchParams.get('date_updated_lt')).toBe(String(updatedBefore.getTime()))
  expect(searchParams.get('include_closed')).toBe('true')
})

test('searchClickUpTasks ignores list ids it cannot place', async () => {
  mockLoadRepos.mockResolvedValue([repo('1000', '1'), repo('2000', '2')])
  serve(workspaces({'1': [[apiTask('t1', 'Chore', 1)]], '2': [[apiTask('t2', 'Chore', 2, '2')]]}))
  const res = await searchTasks({listIds: ['1000', '9999']})
  expect(requestedUrls().map(({pathname}) => pathname)).toEqual(['/api/v2/team/1/task'])
  expect(taskPageUrls()[0]!.searchParams.getAll('list_ids[]')).toEqual(['1000'])
  expect(res.tasks.map(({taskId}) => taskId)).toEqual(['t1'])

  mockFetch.mockClear()
  await expect(searchTasks({listIds: ['9999']})).resolves.toEqual({tasks: [], nextPage: null})
  expect(mockFetch).not.toHaveBeenCalled()
})

test('searchClickUpTasks returns an Error when the list filter cannot be read', async () => {
  mockLoadRepos.mockResolvedValue(null)
  const res = await searchClickUpTasks(ctx, {...params, listIds: ['1000']})
  expect(res).toBeInstanceOf(Error)
  expect(mockFetch).not.toHaveBeenCalled()
})

test('searchClickUpTasks returns no nextPage when every page was short', async () => {
  serve(workspaces({'1': [chores('1', 0, PAGE_SIZE - 1)], '2': [chores('2', 0, 3)]}))
  await expect(searchTasks({queryString: 'login'})).resolves.toEqual({tasks: [], nextPage: null})
  expect(scannedPages()).toEqual(['1:0', '2:0'])
})

test('searchClickUpTasks returns the Error when ClickUp rate-limits the scan', async () => {
  const scan = workspaces({'1': [[]]})
  serve((path, query) =>
    path === '/team/1/task' ? new Response('', {status: 429}) : scan(path, query)
  )
  const res = await searchClickUpTasks(ctx, params)
  expect(res).toBeInstanceOf(Error)
  expect(res).toMatchObject({message: 'ClickUp rate limit reached, try again in a minute'})
})
