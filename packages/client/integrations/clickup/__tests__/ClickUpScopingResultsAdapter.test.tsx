import '../../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {PreloadedQuery} from 'react-relay'
import type {ClickUpScopingResultsAdapterQuery} from '../../../__generated__/ClickUpScopingResultsAdapterQuery.graphql'
import {happyWindow} from '../../../tiptap/extensions/__tests__/installHappyDom'
import type {ScopingResults} from '../../platform/ScopingSearchState'
import ClickUpScopingResultsAdapter from '../ClickUpScopingResultsAdapter'

const NO_RECENT_MATCH =
  'No match among the 300 most recently updated ClickUp tasks. Filter by a list or paste a task link to search further.'

const task = {
  id: '1::86abc',
  title: 'Fix login',
  url: 'https://app.clickup.com/t/86abc',
  taskId: '86abc',
  customId: null,
  listName: 'Sprint 1',
  folderName: 'Q4'
}

const mockPage = {
  edges: [] as {node: typeof task}[],
  error: null as {message: string} | null,
  hasNext: false
}

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  usePreloadedQuery: () => ({}),
  usePaginationFragment: () => ({
    data: {
      viewer: {
        teamMember: {
          integrations: {
            clickup: {tasks: {edges: mockPage.edges, error: mockPage.error}}
          }
        }
      }
    },
    hasNext: mockPage.hasNext,
    isLoadingNext: false,
    loadNext: jest.fn()
  })
}))

const context = {meetingId: 'meeting1', teamId: 'team1', providerId: 'provider1'}
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

const renderAdapter = async (queryString: string) => {
  let results: ScopingResults | undefined
  const queryRef = {
    variables: {teamId: 'team1', queryString, listIds: []}
  } as unknown as PreloadedQuery<ClickUpScopingResultsAdapterQuery>
  await act(async () =>
    root.render(
      <ClickUpScopingResultsAdapter queryRef={queryRef} context={context}>
        {(res) => {
          results = res
          return null
        }}
      </ClickUpScopingResultsAdapter>
    )
  )
  return results!
}

beforeEach(() => {
  mockPage.edges = []
  mockPage.error = null
  mockPage.hasNext = false
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('a text search never asks for the next page, even when ClickUp has older tasks', async () => {
  mockPage.edges = [{node: task}]
  mockPage.hasNext = true
  const results = await renderAdapter('login')
  expect(results.hasNext).toBe(false)
  expect(results.error).toBeUndefined()
  expect(results.items).toEqual([
    {
      serviceTaskId: '1::86abc',
      summary: 'Fix login',
      url: 'https://app.clickup.com/t/86abc',
      linkText: '86abc',
      linkTitle: expect.any(String)
    }
  ])
})

test('a text search with no match among the recent tasks says how to search further', async () => {
  mockPage.hasNext = true
  const results = await renderAdapter('login')
  expect(results.items).toEqual([])
  expect(results.hasNext).toBe(false)
  expect(results.error).toBe(NO_RECENT_MATCH)
})

test('a text search with no match and no older tasks has no guidance', async () => {
  const results = await renderAdapter('login')
  expect(results.error).toBeUndefined()
})

test.each([
  ['a pasted task link', 'https://app.clickup.com/t/86abc', true],
  ['a link with the workspace and a custom id', 'app.clickup.com/t/9012/DEV-12', false],
  ['a custom id', 'DEV-12', true],
  ['a task id', '86bd048jf', false]
])(
  '%s that matches nothing says so instead of pointing at older tasks',
  async (_, queryString, hasNext) => {
    mockPage.hasNext = hasNext
    const results = await renderAdapter(queryString)
    expect(results.items).toEqual([])
    expect(results.error).toBe('No ClickUp task matches that link or ID.')
  }
)

test('a pasted task link that matches shows the task without a message', async () => {
  mockPage.edges = [{node: task}]
  const results = await renderAdapter('https://app.clickup.com/t/86abc')
  expect(results.error).toBeUndefined()
  expect(results.items).toHaveLength(1)
})

test('a server error wins over the guidance', async () => {
  mockPage.hasNext = true
  mockPage.error = {message: 'ClickUp rate limit reached, try again in a minute'}
  const results = await renderAdapter('login')
  expect(results.error).toBe('ClickUp rate limit reached, try again in a minute')
})

test('an empty search keeps paging through ClickUp', async () => {
  mockPage.edges = [{node: task}]
  mockPage.hasNext = true
  const results = await renderAdapter('')
  expect(results.hasNext).toBe(true)
  expect(results.error).toBeUndefined()
})
