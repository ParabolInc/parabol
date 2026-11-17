jest.mock('../searchClickUpTasks', () => ({__esModule: true, default: jest.fn()}))

import type {GraphQLResolveInfo} from 'graphql'
import type {DataLoaderWorker, GQLContext} from '../../../graphql/graphql'
import makeClickUpTaskConnection from '../makeClickUpTaskConnection'
import type {ClickUpTaskSource} from '../mapClickUpTask'
import searchClickUpTasks from '../searchClickUpTasks'

const mockedSearch = jest.mocked(searchClickUpTasks)

const ctx = {
  dataLoader: {} as DataLoaderWorker,
  teamId: 'team1',
  userId: 'user1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo
}

const node = {id: '9015::86abc', taskId: '86abc'} as ClickUpTaskSource

beforeEach(() => {
  mockedSearch.mockReset()
  mockedSearch.mockResolvedValue({tasks: [node], nextPage: null})
})

test('makeClickUpTaskConnection starts on the first page and trims the query', async () => {
  await makeClickUpTaskConnection(ctx, {first: 50, queryString: '  login  '})
  expect(mockedSearch).toHaveBeenCalledWith(
    ctx,
    expect.objectContaining({queryString: 'login', page: 0, listIds: [], assignedToViewer: false})
  )
})

test('makeClickUpTaskConnection reads the cursor as the next ClickUp page', async () => {
  await makeClickUpTaskConnection(ctx, {first: 50, after: '2'})
  expect(mockedSearch).toHaveBeenCalledWith(ctx, expect.objectContaining({page: 2}))
})

test.each(['-1', '1.5', 'abc', '9999999999999999999'])(
  'makeClickUpTaskConnection refuses the cursor %s without searching',
  async (after) => {
    const res = await makeClickUpTaskConnection(ctx, {first: 50, after})
    expect(res.error).toEqual({message: 'Invalid cursor'})
    expect(res.edges).toEqual([])
    expect(mockedSearch).not.toHaveBeenCalled()
  }
)

test.each([
  [0, 1],
  [50, 50],
  [1000, 100]
])('makeClickUpTaskConnection turns first=%i into minResults=%i', async (first, minResults) => {
  await makeClickUpTaskConnection(ctx, {first})
  expect(mockedSearch).toHaveBeenCalledWith(ctx, expect.objectContaining({minResults}))
})

test('makeClickUpTaskConnection pages by the next ClickUp page', async () => {
  mockedSearch.mockResolvedValue({tasks: [node], nextPage: 3})
  const res = await makeClickUpTaskConnection(ctx, {first: 50, after: '2'})
  expect(res.edges).toEqual([{node, cursor: '3'}])
  expect(res.pageInfo).toEqual({
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: '2',
    endCursor: '3'
  })
})

test('makeClickUpTaskConnection ends the connection on the last page', async () => {
  const res = await makeClickUpTaskConnection(ctx, {first: 50})
  expect(res.pageInfo).toEqual({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null
  })
})

test('makeClickUpTaskConnection carries a search Error in the connection', async () => {
  mockedSearch.mockResolvedValue(new Error('ClickUp rate limit reached, try again in a minute'))
  const res = await makeClickUpTaskConnection(ctx, {first: 50})
  expect(res.edges).toEqual([])
  expect(res.error).toEqual({message: 'ClickUp rate limit reached, try again in a minute'})
})
