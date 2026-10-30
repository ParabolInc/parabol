import type {GraphQLResolveInfo} from 'graphql'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import getKysely from '../../../../postgres/getKysely'
import {getEmbeddingsByRRF} from '../../../../postgres/queries/getEmbeddingsByRRF'
import {
  getPagesByKeyword,
  type PageSearchResults
} from '../../../../postgres/queries/getPagesByKeyword'
import {getPagesByRRF} from '../../../../postgres/queries/getPagesByRRF'
import {
  decodePageSearchCursor,
  encodePageSearchCursor
} from '../../../../postgres/queries/pageSearchCursor'
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
jest.mock('../../../../postgres/queries/getEmbeddingsByRRF', () => ({
  getEmbeddingsByRRF: jest.fn()
}))
jest.mock('../../../../postgres/queries/getPagesByKeyword', () => ({getPagesByKeyword: jest.fn()}))
jest.mock('../../../../postgres/queries/getPagesByRRF', () => ({getPagesByRRF: jest.fn()}))
jest.mock('../../../../utils/Logger', () => ({Logger: {warn: jest.fn()}}))
const mockActiveDefinition: {pageAlpha?: number} = {}
jest.mock('../../../../../embedder/activeEmbeddingModel', () => {
  const actual = jest.requireActual<typeof import('../../../../../embedder/activeEmbeddingModel')>(
    '../../../../../embedder/activeEmbeddingModel'
  )
  return {
    ...actual,
    get activeEmbeddingDefinition() {
      return {...actual.activeEmbeddingDefinition, ...mockActiveDefinition}
    }
  }
})

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
const fusedCursorAfterTwenty = encodePageSearchCursor('fused', 20)
const keywordCursorAfterTwenty = encodePageSearchCursor('keyword', 20)

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
    offset: 0,
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
    alpha: 0.01,
    k: 60,
    first: 20,
    offset: 0,
    viewerId,
    teamIds: undefined,
    dateRange: null
  })
  expect(getPagesByKeyword).not.toHaveBeenCalled()
  expect(Logger.warn).not.toHaveBeenCalled()
})

it('uses the alpha a page search gives', async () => {
  jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
  await callSearch({query: 'retro', alpha: 0.5})
  expect(getPagesByRRF).toHaveBeenCalledWith(expect.objectContaining({alpha: 0.5}))
})

it("defaults page search to the active generation's alpha", async () => {
  mockActiveDefinition.pageAlpha = 0.3
  try {
    jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
    await callSearch({query: 'retro'})
    expect(getPagesByRRF).toHaveBeenCalledWith(expect.objectContaining({alpha: 0.3}))
  } finally {
    delete mockActiveDefinition.pageAlpha
  }
})

it('keeps alpha 0.25 as the default for other search types', async () => {
  jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
  await callSearch({query: 'retro', type: 'meetingTemplate'})
  expect(getEmbeddingsByRRF).toHaveBeenCalledWith(
    expect.objectContaining({alpha: 0.25, type: 'meetingTemplate'})
  )
})

it('waits at most 3 seconds for the query embedding', async () => {
  await callSearch({query: 'retro'})
  expect(getUserQueryJobData).toHaveBeenCalledWith('retro', 3000)
})

it('continues keyword search from the cursor', async () => {
  await callSearch({query: 'retro', alpha: 0, after: keywordCursorAfterTwenty})
  expect(getPagesByKeyword).toHaveBeenCalledWith(expect.objectContaining({offset: 20}))
})

it('continues fused search from the cursor', async () => {
  jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
  jest.mocked(getPagesByRRF).mockResolvedValue(fusedResults)
  await callSearch({query: 'retro', after: fusedCursorAfterTwenty})
  expect(getPagesByRRF).toHaveBeenCalledWith(expect.objectContaining({offset: 20}))
})

it('continues keyword results that replaced fused results as keyword results', async () => {
  await callSearch({query: 'retro', after: keywordCursorAfterTwenty})
  expect(getPagesByKeyword).toHaveBeenCalledWith(expect.objectContaining({offset: 20}))
  expect(publishToEmbedder).not.toHaveBeenCalled()
})

it.each([
  [
    'the query embedding fails',
    'embedding failed',
    () => jest.mocked(publishToEmbedder).mockResolvedValue(new Error('embedder unavailable'))
  ],
  [
    'the query embedding times out',
    'embedding timed out',
    () =>
      jest
        .mocked(publishToEmbedder)
        .mockResolvedValue(new EmbeddingTimeoutError('Embedding timeout for request: 7'))
  ],
  [
    'fused ranking throws',
    'fused ranking failed',
    () => {
      jest.mocked(publishToEmbedder).mockResolvedValue(new Float32Array(1024))
      jest.mocked(getPagesByRRF).mockRejectedValue(new Error('boom'))
    }
  ]
])('asks for a retry on a later fused page when %s', async (_label, reason, arrange) => {
  arrange()
  await expect(callSearch({query: 'retro', after: fusedCursorAfterTwenty})).rejects.toThrow(
    'Page search could not rank this page. Retry the request.'
  )
  expect(getPagesByKeyword).not.toHaveBeenCalled()
  expect(Logger.warn).toHaveBeenCalledWith('Page search could not continue fused results', {
    userId: viewerId,
    extras: expect.objectContaining({reason})
  })
})

it.each([
  ['text', {after: 'not a cursor'}],
  [
    'a cursor from before paging worked',
    {after: btoa(JSON.stringify({codes: [1], maxScore: 0.5}))}
  ],
  ['a recent-pages cursor', {after: encodePageSearchCursor('recent', 20)}],
  ['a fused cursor with alpha 0', {after: fusedCursorAfterTwenty, alpha: 0}]
])('rejects %s for a page search', async (_label, args) => {
  await expect(callSearch({query: 'retro', ...args})).rejects.toThrow(
    'after must be an endCursor from the same page search'
  )
  expect(publishToEmbedder).not.toHaveBeenCalled()
  expect(getPagesByKeyword).not.toHaveBeenCalled()
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

describe('recent pages for an empty query', () => {
  const recentSuffix = Date.now()
  const recentViewerId = `user-search-recent-${recentSuffix}`
  const recentOrgId = `org-search-recent-${recentSuffix}`
  const recentTeamIds = [`team-recent-a-${recentSuffix}`, `team-recent-b-${recentSuffix}`]
  const recentContext = {
    authToken: {sub: recentViewerId, tms: recentTeamIds},
    dataLoader
  } as unknown as GQLContext
  const recentPageIds: number[] = []
  let trashedPageId: number

  const recentPages = async (args: {after?: string; teamIds?: string[]} = {}) => {
    if (typeof search !== 'function') throw new Error('search must be a resolver function')
    const results = await search(
      {} as User,
      {query: '', first: 2, type: 'page', ...args},
      recentContext,
      {} as GraphQLResolveInfo
    )
    return results as PageSearchResults
  }

  beforeAll(async () => {
    const pg = getKysely()
    await pg
      .insertInto('User')
      .values({
        id: recentViewerId,
        email: `${recentViewerId}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: 'Recent Pages Viewer'
      })
      .execute()
    await pg
      .insertInto('Organization')
      .values({id: recentOrgId, name: 'Recent Pages Org'})
      .execute()
    await pg
      .insertInto('Team')
      .values(recentTeamIds.map((id) => ({id, name: id, orgId: recentOrgId})))
      .execute()
    for (const day of ['01', '02', '02']) {
      const {id} = await pg
        .insertInto('Page')
        .values({
          title: `Recent ${recentPageIds.length + 1}`,
          plaintextContent: '',
          userId: recentViewerId,
          sortOrder: 'a0',
          updatedAt: new Date(`2026-01-${day}T00:00:00Z`)
        })
        .returning('id')
        .executeTakeFirstOrThrow()
      recentPageIds.push(id)
    }
    await pg
      .insertInto('PageAccess')
      .values(
        recentPageIds.map((pageId) => ({userId: recentViewerId, pageId, role: 'owner' as const}))
      )
      .execute()
    await pg
      .insertInto('PageTeamAccess')
      .values(
        recentTeamIds.map((teamId) => ({
          pageId: recentPageIds[0]!,
          teamId,
          role: 'editor' as const
        }))
      )
      .execute()
    const trashedPage = await pg
      .insertInto('Page')
      .values({
        title: 'Trashed',
        plaintextContent: '',
        userId: recentViewerId,
        sortOrder: 'a0',
        updatedAt: new Date('2026-01-03T00:00:00Z'),
        deletedAt: new Date('2026-01-03T00:00:00Z')
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    trashedPageId = trashedPage.id
    await pg
      .insertInto('PageAccess')
      .values({userId: recentViewerId, pageId: trashedPageId, role: 'owner'})
      .execute()
  })

  afterAll(async () => {
    const pg = getKysely()
    await pg.deleteFrom('Team').where('orgId', '=', recentOrgId).execute()
    await pg.deleteFrom('Organization').where('id', '=', recentOrgId).execute()
    await pg.deleteFrom('User').where('id', '=', recentViewerId).execute()
  })

  it('pages through recent pages from the cursor, newest first', async () => {
    const firstPage = await recentPages()
    expect(firstPage.edges.map(({nodeId}) => nodeId)).toEqual([recentPageIds[2], recentPageIds[1]])
    expect(firstPage.pageInfo.hasNextPage).toBe(true)
    const secondPage = await recentPages({after: firstPage.pageInfo.endCursor!})
    expect(secondPage.edges.map(({nodeId}) => nodeId)).toEqual([recentPageIds[0]])
    expect(secondPage.pageInfo.hasNextPage).toBe(false)
    expect(decodePageSearchCursor(secondPage.pageInfo.endCursor!)).toEqual({
      ranking: 'recent',
      position: 3
    })
  })

  it('leaves trashed pages out', async () => {
    const {edges} = await recentPages()
    expect(edges.map(({nodeId}) => nodeId)).toEqual([recentPageIds[2], recentPageIds[1]])
    expect(edges.map(({nodeId}) => nodeId)).not.toContain(trashedPageId)
  })

  it('lists a page shared with several requested teams once', async () => {
    const {edges} = await recentPages({teamIds: recentTeamIds})
    expect(edges.map(({nodeId}) => nodeId)).toEqual([recentPageIds[0]])
  })

  it.each(['fused', 'keyword'] as const)(
    'rejects a %s cursor from a page search with a query',
    async (ranking) =>
      expect(recentPages({after: encodePageSearchCursor(ranking, 2)})).rejects.toThrow(
        'after must be an endCursor from the same page search'
      )
  )
})
