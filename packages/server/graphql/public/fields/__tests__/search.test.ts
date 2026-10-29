import type {GraphQLResolveInfo} from 'graphql'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import getKysely from '../../../../postgres/getKysely'
import {
  getPagesByKeyword,
  type PageSearchResults
} from '../../../../postgres/queries/getPagesByKeyword'
import {getPagesByRRF} from '../../../../postgres/queries/getPagesByRRF'
import type {User} from '../../../../postgres/types'
import {EmbeddingTimeoutError} from '../../../../utils/EmbeddingTimeoutError'
import {Logger} from '../../../../utils/Logger'
import type {GQLContext} from '../../../graphql'
import {getUserQueryJobData, publishToEmbedder} from '../../../mutations/helpers/publishToEmbedder'
import type {SearchTypeEnum} from '../../resolverTypes'
import {search} from '../search'

jest.mock('../../../mutations/helpers/publishToEmbedder', () => ({
  getUserQueryJobData: jest.fn(),
  publishToEmbedder: jest.fn()
}))
jest.mock('../../../../postgres/queries/getPagesByKeyword', () => ({getPagesByKeyword: jest.fn()}))
jest.mock('../../../../postgres/queries/getPagesByRRF', () => ({getPagesByRRF: jest.fn()}))
jest.mock('../../../../utils/Logger', () => ({Logger: {warn: jest.fn()}}))

const viewerId = 'user-search-test'
const dataLoader = getNewDataLoader('searchTest')
const context = {authToken: {sub: viewerId, tms: []}, dataLoader} as unknown as GQLContext

const pageInfo = {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null}
const keywordResults: PageSearchResults = {
  pageInfo,
  edges: [
    {
      nodeTypeName: 'page',
      nodeId: 1,
      score: {keyword: 1, vector: 0, keywordRank: 1, vectorRank: null, combined: 1 / 61},
      snippets: []
    }
  ]
}
const fusedResults: Awaited<ReturnType<typeof getPagesByRRF>> = {pageInfo, edges: []}
const pageCursor = btoa(JSON.stringify({codes: [1], maxScore: 0.5}))

const callSearch = (args: {
  query: string
  after?: string
  alpha?: number
  type?: SearchTypeEnum
  startAt?: Date
}) => {
  if (typeof search !== 'function') throw new Error('search must be a resolver function')
  return search({} as User, {first: 20, type: 'page', ...args}, context, {} as GraphQLResolveInfo)
}

const expectKeywordFallbackLogged = (extras: Record<string, unknown>) =>
  expect(Logger.warn).toHaveBeenCalledWith('Page search used keyword results', {
    userId: viewerId,
    extras
  })

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(getPagesByKeyword).mockResolvedValue(keywordResults)
})

afterEach(() => {
  jest.useRealTimers()
})

afterAll(async () => {
  dataLoader.dispose()
  await getKysely().destroy()
})

it('uses keyword search without embedding when alpha is 0', async () => {
  expect(await callSearch({query: 'retro', alpha: 0})).toBe(keywordResults)
  expect(publishToEmbedder).not.toHaveBeenCalled()
  expect(Logger.warn).not.toHaveBeenCalled()
})

it('searches for the trimmed query', async () => {
  await callSearch({query: '  retro  ', alpha: 0})
  expect(getPagesByKeyword).toHaveBeenCalledWith({
    query: 'retro',
    first: 20,
    viewerId,
    teamIds: undefined,
    dateRange: null
  })
})

it('searches up to the far future when only startAt is given', async () => {
  const startAt = new Date('2026-10-01T00:00:00Z')
  await callSearch({query: 'retro', alpha: 0, startAt})
  expect(getPagesByKeyword).toHaveBeenCalledWith(
    expect.objectContaining({
      dateRange: {startAt, endAt: new Date('9999-12-31T23:59:59.999Z'), dateField: 'createdAt'}
    })
  )
})

it('falls back to keyword search when the query embedding fails', async () => {
  jest.mocked(publishToEmbedder).mockResolvedValue(new Error('embedder unavailable'))
  expect(await callSearch({query: 'retro'})).toBe(keywordResults)
  expect(getPagesByRRF).not.toHaveBeenCalled()
  expectKeywordFallbackLogged({reason: 'embedding failed', errorMessage: 'embedder unavailable'})
})

it('falls back to keyword search when the embedder reports a timeout', async () => {
  jest
    .mocked(publishToEmbedder)
    .mockResolvedValue(new EmbeddingTimeoutError('Embedding timeout for request: 7'))
  expect(await callSearch({query: 'retro'})).toBe(keywordResults)
  expect(getPagesByRRF).not.toHaveBeenCalled()
  expectKeywordFallbackLogged({reason: 'embedding timed out'})
})

it('returns keyword results without a warning when the embedder is disabled', async () => {
  jest.mocked(publishToEmbedder).mockResolvedValue(undefined)
  expect(await callSearch({query: 'retro'})).toBe(keywordResults)
  expect(getPagesByRRF).not.toHaveBeenCalled()
  expect(Logger.warn).not.toHaveBeenCalled()
})

it('falls back to keyword search when queueing the embedding rejects', async () => {
  jest.mocked(publishToEmbedder).mockRejectedValue(new Error('redis down'))
  expect(await callSearch({query: 'retro'})).toBe(keywordResults)
  expect(getPagesByRRF).not.toHaveBeenCalled()
  expectKeywordFallbackLogged({reason: 'embedding failed', errorMessage: 'redis down'})
})

it('falls back to keyword search when the embedding step outlasts 3 seconds', async () => {
  jest.useFakeTimers()
  jest.mocked(publishToEmbedder).mockReturnValue(new Promise<never>(() => {}))
  const results = callSearch({query: 'retro'})
  await jest.advanceTimersByTimeAsync(2999)
  expect(getPagesByKeyword).not.toHaveBeenCalled()
  await jest.advanceTimersByTimeAsync(1)
  expect(await results).toBe(keywordResults)
  expect(getPagesByRRF).not.toHaveBeenCalled()
  expectKeywordFallbackLogged({reason: 'embedding timed out'})
})

it('clears the embedding timer once the embedding settles', async () => {
  jest.useFakeTimers()
  jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
  jest.mocked(getPagesByRRF).mockResolvedValue(fusedResults)
  await callSearch({query: 'retro'})
  expect(jest.getTimerCount()).toBe(0)
})

it('falls back to keyword search when fused ranking throws', async () => {
  jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
  jest.mocked(getPagesByRRF).mockRejectedValue(new Error('boom'))
  expect(await callSearch({query: 'retro'})).toBe(keywordResults)
  expectKeywordFallbackLogged({reason: 'fused ranking failed', errorMessage: 'boom'})
})

it('returns fused results when the query embeds in time', async () => {
  const queryVector = new Float32Array(1024)
  jest.mocked(publishToEmbedder).mockResolvedValue(queryVector)
  jest.mocked(getPagesByRRF).mockResolvedValue(fusedResults)
  expect(await callSearch({query: 'retro'})).toBe(fusedResults)
  expect(getPagesByRRF).toHaveBeenCalledWith({
    query: 'retro',
    queryVector,
    alpha: 0.25,
    k: 60,
    first: 20,
    viewerId,
    teamIds: undefined,
    dateRange: null
  })
  expect(getPagesByKeyword).not.toHaveBeenCalled()
  expect(Logger.warn).not.toHaveBeenCalled()
})

it('waits at most 3 seconds for the query embedding', async () => {
  await callSearch({query: 'retro'})
  expect(getUserQueryJobData).toHaveBeenCalledWith('retro', 3000)
})

it.each([
  ['alpha 0 and a page cursor', 0, pageCursor],
  ['alpha 0 and a malformed cursor', 0, 'not a cursor'],
  ['the default alpha and a page cursor', undefined, pageCursor],
  ['the default alpha and a malformed cursor', undefined, 'not a cursor']
])('returns no results after the first page with %s', async (_label, alpha, after) => {
  expect(await callSearch({query: 'retro', alpha, after})).toEqual({pageInfo, edges: []})
  expect(publishToEmbedder).not.toHaveBeenCalled()
  expect(getPagesByKeyword).not.toHaveBeenCalled()
  expect(getPagesByRRF).not.toHaveBeenCalled()
  expect(Logger.warn).not.toHaveBeenCalled()
})

it('treats a whitespace-only query like an empty one', async () => {
  await callSearch({query: '   '})
  expect(publishToEmbedder).not.toHaveBeenCalled()
  expect(getPagesByKeyword).not.toHaveBeenCalled()
})

it.each([
  ['the query embedding fails', new Error('timeout')],
  ['the embedder is disabled', undefined]
])('still fails other search types when %s', async (_cause, vector) => {
  jest.mocked(publishToEmbedder).mockResolvedValue(vector)
  await expect(callSearch({query: 'retro', type: 'meetingTemplate'})).rejects.toThrow(
    'Error calling search'
  )
  expect(getUserQueryJobData).toHaveBeenCalledWith('retro')
  expect(getPagesByKeyword).not.toHaveBeenCalled()
})
