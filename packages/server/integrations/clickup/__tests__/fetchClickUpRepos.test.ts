jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))

import {fetch, Response} from '@whatwg-node/fetch'
import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import getRedis from '../../../utils/getRedis'
import type {GqlIntegrationCtx} from '../../platform/ServerIntegrationDefinition'
import fetchClickUpRepos from '../fetchClickUpRepos'
import makeMemoryRedis from './memoryRedis'

const mockFetch = jest.mocked(fetch)
const mockGetRedis = jest.mocked(getRedis)

const API_URL = 'https://api.clickup.com/api/v2'

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

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

const pathOf = (input: Parameters<typeof fetch>[0]) => String(input).slice(API_URL.length)

const serve = (routes: Record<string, unknown>) => {
  mockFetch.mockImplementation(async (input) => {
    const path = pathOf(input)
    const route = routes[path]
    if (route === undefined) return jsonResponse({err: `No route for ${path}`}, 404)
    return route instanceof Response ? route : jsonResponse(route)
  })
}

const list = (id: string, name: string, permission_level = 'create') => ({
  id,
  name,
  permission_level
})

const engRoutes = {
  '/team/1/space?archived=false': {spaces: [{id: '10', name: 'Eng'}]},
  '/space/10/folder?archived=false': {
    folders: [
      {id: '100', name: 'Q4', lists: [list('1000', 'Sprint 1')]},
      {id: '101', name: 'Hotfix', parent_folder: '100', lists: [list('1001', 'Bugs')]}
    ]
  },
  '/space/10/list?archived=false': {lists: [list('1002', 'Inbox')]}
}

beforeEach(() => {
  mockFetch.mockReset()
  mockGetRedis.mockReturnValue(makeMemoryRedis().redis)
})

test('fetchClickUpRepos names lists Space / Folder / List and chains subfolders', async () => {
  serve({'/team': {teams: [{id: '1', name: 'Acme'}]}, ...engRoutes})
  await expect(fetchClickUpRepos(ctx)).resolves.toEqual([
    {service: 'clickup', id: '1000', workspaceId: '1', name: 'Eng / Q4 / Sprint 1'},
    {service: 'clickup', id: '1001', workspaceId: '1', name: 'Eng / Q4 / Hotfix / Bugs'},
    {service: 'clickup', id: '1002', workspaceId: '1', name: 'Eng / Inbox'}
  ])
})

test('fetchClickUpRepos prefixes the workspace name when two workspaces are authorized', async () => {
  serve({
    '/team': {
      teams: [
        {id: '1', name: 'Acme'},
        {id: '2', name: 'Globex'}
      ]
    },
    ...engRoutes,
    '/team/2/space?archived=false': {spaces: [{id: '20', name: 'Ops'}]},
    '/space/20/folder?archived=false': {folders: []},
    '/space/20/list?archived=false': {lists: [list('2000', 'Runbooks')]}
  })
  await expect(fetchClickUpRepos(ctx)).resolves.toEqual([
    {service: 'clickup', id: '1000', workspaceId: '1', name: 'Acme / Eng / Q4 / Sprint 1'},
    {service: 'clickup', id: '1001', workspaceId: '1', name: 'Acme / Eng / Q4 / Hotfix / Bugs'},
    {service: 'clickup', id: '1002', workspaceId: '1', name: 'Acme / Eng / Inbox'},
    {service: 'clickup', id: '2000', workspaceId: '2', name: 'Globex / Ops / Runbooks'}
  ])
})

test.each(['read', 'comment'])(
  'fetchClickUpRepos drops a list with permission_level %s',
  async (permissionLevel) => {
    serve({
      '/team': {teams: [{id: '1', name: 'Acme'}]},
      '/team/1/space?archived=false': {spaces: [{id: '10', name: 'Eng'}]},
      '/space/10/folder?archived=false': {
        folders: [
          {id: '100', name: 'Q4', lists: [list('1000', 'Sprint 1', permissionLevel)]},
          {id: '101', name: 'Q1', lists: [list('1001', 'Sprint 2')]}
        ]
      },
      '/space/10/list?archived=false': {lists: [list('1002', 'Inbox', permissionLevel)]}
    })
    const repos = await fetchClickUpRepos(ctx)
    expect(repos).toEqual([
      {service: 'clickup', id: '1001', workspaceId: '1', name: 'Eng / Q1 / Sprint 2'}
    ])
  }
)

test("fetchClickUpRepos reads a folder's lists when Get Folders gives only their ids", async () => {
  serve({
    '/team': {teams: [{id: '1', name: 'Acme'}]},
    '/team/1/space?archived=false': {spaces: [{id: '10', name: 'Eng'}]},
    '/space/10/folder?archived=false': {folders: [{id: '100', name: 'Q4', lists: ['1000']}]},
    '/folder/100/list?archived=false': {lists: [list('1000', 'Sprint 1')]},
    '/space/10/list?archived=false': {lists: []}
  })
  await expect(fetchClickUpRepos(ctx)).resolves.toEqual([
    {service: 'clickup', id: '1000', workspaceId: '1', name: 'Eng / Q4 / Sprint 1'}
  ])
})

test('fetchClickUpRepos skips the hidden folder that holds folderless lists', async () => {
  serve({
    '/team': {teams: [{id: '1', name: 'Acme'}]},
    '/team/1/space?archived=false': {spaces: [{id: '10', name: 'Eng'}]},
    '/space/10/folder?archived=false': {
      folders: [{id: '457', name: 'hidden', hidden: true, lists: [list('1002', 'Inbox')]}]
    },
    '/space/10/list?archived=false': {lists: [list('1002', 'Inbox')]}
  })
  await expect(fetchClickUpRepos(ctx)).resolves.toEqual([
    {service: 'clickup', id: '1002', workspaceId: '1', name: 'Eng / Inbox'}
  ])
})

test('fetchClickUpRepos returns [] when no workspace is authorized', async () => {
  serve({'/team': {teams: []}})
  await expect(fetchClickUpRepos(ctx)).resolves.toEqual([])
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('fetchClickUpRepos returns the Error when ClickUp rate-limits it mid-walk', async () => {
  serve({
    '/team': {teams: [{id: '1', name: 'Acme'}]},
    ...engRoutes,
    '/space/10/list?archived=false': new Response('', {status: 429})
  })
  const result = await fetchClickUpRepos(ctx)
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe('ClickUp rate limit reached, try again in a minute')
})

test('fetchClickUpRepos walks at most 4 Spaces at a time', async () => {
  const spaces = Array.from({length: 6}, (_, i) => ({id: String(10 + i), name: `Space ${i}`}))
  const requestsBySpace = new Map<string, number>()
  let mostSpacesAtOnce = 0
  mockFetch.mockImplementation(async (input) => {
    const path = pathOf(input)
    if (path === '/team') return jsonResponse({teams: [{id: '1', name: 'Acme'}]})
    if (path === '/team/1/space?archived=false') return jsonResponse({spaces})
    const spaceId = /^\/space\/(\d+)\//.exec(path)![1]!
    requestsBySpace.set(spaceId, (requestsBySpace.get(spaceId) ?? 0) + 1)
    mostSpacesAtOnce = Math.max(mostSpacesAtOnce, requestsBySpace.size)
    await new Promise((resolve) => setTimeout(resolve, 5))
    const pending = requestsBySpace.get(spaceId)! - 1
    if (pending === 0) requestsBySpace.delete(spaceId)
    else requestsBySpace.set(spaceId, pending)
    if (path.includes('/folder')) return jsonResponse({folders: []})
    return jsonResponse({lists: [list(`${spaceId}00`, 'Backlog')]})
  })
  const repos = await fetchClickUpRepos(ctx)
  expect(mostSpacesAtOnce).toBe(4)
  expect(repos).toHaveLength(6)
})
