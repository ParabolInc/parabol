import {sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import getKysely from '../../getKysely'
import {getPagesByRRF} from '../getPagesByRRF'
import {decodePageSearchCursor} from '../pageSearchCursor'

const pg = getKysely()
const suffix = `pbr-${Date.now()}`
const viewerId = `viewer-${suffix}`
const otherUserId = `other-${suffix}`
const bulkViewerId = `bulk-${suffix}`
const junkViewerId = `junk-${suffix}`
const BULK_PAGE_COUNT = 101
const orgId = `org-${suffix}`
const teamId = `team-${suffix}`
const chunkTable = getEmbeddingsPagesTableName(activeEmbeddingModelId)!
const EMBEDDING_DIMENSIONS = 1024

const queryVector = Float32Array.from({length: EMBEDDING_DIMENSIONS}, (_, i) => (i === 0 ? 1 : 0))
const vectorWithCosine = (cosine: number) => [
  cosine,
  Math.sqrt(1 - cosine * cosine),
  ...new Array<number>(EMBEDDING_DIMENSIONS - 2).fill(0)
]
const zeroVector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0)
const FILLER_TEXT =
  'Notes from the weekly sync about hiring, budgets and the offsite plan. '.repeat(5)

let keywordOnlyId: number
let vectorOnlyId: number
let bothArmsId: number
let belowFloorId: number
let trashedId: number
let otherUsersId: number
let zeroChunkOnlyId: number
let mixedChunksId: number
let olderTwinId: number
let newerTwinId: number
let nearEmptyId: number
let nearEmptyKeywordId: number
let shortJapaneseId: number

const makeUser = (id: string, preferredName: string) => ({
  id,
  email: `${id}@example.com`,
  picture: 'https://example.com/pic.png',
  preferredName
})

const insertPage = async (
  title: string,
  {
    userId = viewerId,
    updatedAt,
    deletedAt,
    plaintextContent = FILLER_TEXT
  }: {userId?: string; updatedAt?: Date; deletedAt?: Date; plaintextContent?: string} = {}
) => {
  const {id} = await pg
    .insertInto('Page')
    .values({title, plaintextContent, userId, sortOrder: 'a0', updatedAt, deletedAt})
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const insertVectors = (pageId: number, vectors: number[][]) =>
  pg
    .insertInto(chunkTable)
    .values(
      vectors.map((vector, chunkNumber) => ({
        pageId,
        chunkNumber,
        embedding: numberVectorToString(vector),
        embedText: '',
        tsv: sql<string>`to_tsvector('simple', '')`,
        pageUpdatedAt: new Date()
      }))
    )
    .execute()

const insertChunks = (pageId: number, cosines: number[]) =>
  insertVectors(pageId, cosines.map(vectorWithCosine))

beforeAll(async () => {
  const {rows} = await sql<{
    chunkTable: string | null
  }>`select to_regclass(${`"${chunkTable}"`})::text as "chunkTable"`.execute(pg)
  expect(rows[0]!.chunkTable).not.toBeNull()
  await pg
    .insertInto('User')
    .values([
      makeUser(viewerId, 'Fusion Viewer'),
      makeUser(otherUserId, 'Fusion Other'),
      makeUser(bulkViewerId, 'Fusion Bulk'),
      makeUser(junkViewerId, 'Fusion Junk')
    ])
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Fusion Search Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Fusion Team', orgId}).execute()
  keywordOnlyId = await insertPage('Quarterly roadmap')
  vectorOnlyId = await insertPage('Planning notes')
  bothArmsId = await insertPage('Roadmap review', {updatedAt: new Date('2026-01-01T00:00:00Z')})
  belowFloorId = await insertPage('Lunch menu')
  trashedId = await insertPage('Trashed roadmap', {deletedAt: new Date()})
  otherUsersId = await insertPage('Roadmap secret', {userId: otherUserId})
  zeroChunkOnlyId = await insertPage('Blank chunk', {userId: otherUserId})
  mixedChunksId = await insertPage('Mixed chunks', {userId: otherUserId})
  newerTwinId = await insertPage('Newer twin', {
    userId: otherUserId,
    updatedAt: new Date('2026-01-02T00:00:00Z')
  })
  olderTwinId = await insertPage('Older twin', {
    userId: otherUserId,
    updatedAt: new Date('2026-01-01T00:00:00Z')
  })
  await pg
    .insertInto('PageAccess')
    .values([
      ...[keywordOnlyId, vectorOnlyId, bothArmsId, belowFloorId, trashedId].map((pageId) => ({
        userId: viewerId,
        pageId,
        role: 'owner' as const
      })),
      ...[otherUsersId, zeroChunkOnlyId, mixedChunksId, olderTwinId, newerTwinId].map((pageId) => ({
        userId: otherUserId,
        pageId,
        role: 'owner' as const
      }))
    ])
    .execute()
  await pg
    .insertInto('PageTeamAccess')
    .values({pageId: bothArmsId, teamId, role: 'editor'})
    .execute()
  await insertChunks(vectorOnlyId, [0.9])
  await insertChunks(bothArmsId, [0.5, 0.8])
  await insertChunks(belowFloorId, [0.2])
  await insertChunks(trashedId, [0.99])
  await insertChunks(otherUsersId, [0.95])
  await insertVectors(zeroChunkOnlyId, [zeroVector])
  await insertVectors(mixedChunksId, [zeroVector, vectorWithCosine(0.88)])
  await insertChunks(olderTwinId, [0.6])
  await insertChunks(newerTwinId, [0.6])
  const bulkPages = await pg
    .insertInto('Page')
    .values(
      Array.from({length: BULK_PAGE_COUNT}, (_, i) => ({
        title: `Bulk note ${i + 1}`,
        plaintextContent: FILLER_TEXT,
        userId: bulkViewerId,
        sortOrder: 'a0'
      }))
    )
    .returning('id')
    .execute()
  await pg
    .insertInto('PageAccess')
    .values(bulkPages.map(({id}) => ({userId: bulkViewerId, pageId: id, role: 'owner' as const})))
    .execute()
  await Promise.all(bulkPages.map(({id}) => insertChunks(id, [0.5])))
  nearEmptyId = await insertPage('Sticky note', {
    userId: junkViewerId,
    plaintextContent: 'Remember the thing.'
  })
  nearEmptyKeywordId = await insertPage('Roadmap', {userId: junkViewerId, plaintextContent: 'tbd'})
  shortJapaneseId = await insertPage('会議のメモ', {
    userId: junkViewerId,
    plaintextContent: '会議のメモ'.repeat(14)
  })
  await pg
    .insertInto('PageAccess')
    .values(
      [nearEmptyId, nearEmptyKeywordId, shortJapaneseId].map((pageId) => ({
        userId: junkViewerId,
        pageId,
        role: 'owner' as const
      }))
    )
    .execute()
  await insertChunks(nearEmptyId, [0.95])
  await insertChunks(nearEmptyKeywordId, [0.96])
  await insertChunks(shortJapaneseId, [0.8])
})

afterAll(async () => {
  await pg
    .deleteFrom(chunkTable)
    .where('pageId', 'in', (qb) =>
      qb
        .selectFrom('Page')
        .select('id')
        .where('userId', 'in', [viewerId, otherUserId, bulkViewerId, junkViewerId])
    )
    .execute()
  await pg.deleteFrom('Team').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg
    .deleteFrom('User')
    .where('id', 'in', [viewerId, otherUserId, bulkViewerId, junkViewerId])
    .execute()
  await pg.destroy()
})

const fused = (alpha: number, overrides: Partial<Parameters<typeof getPagesByRRF>[0]> = {}) =>
  getPagesByRRF({
    query: 'roadmap',
    queryVector,
    alpha,
    k: 60,
    first: 20,
    offset: 0,
    viewerId,
    teamIds: undefined,
    dateRange: null,
    ...overrides
  })

it('returns each page found by either arm exactly once', async () => {
  const ids = (await fused(0.5)).edges.map((e) => e.nodeId)
  expect(ids.sort()).toEqual([keywordOnlyId, bothArmsId, vectorOnlyId].sort())
})

it('drops vector-only pages below the similarity floor', async () =>
  expect((await fused(0.5)).edges.map((e) => e.nodeId)).not.toContain(belowFloorId))

it('scores a page by its best chunk', async () =>
  expect((await fused(0.5)).edges.find((e) => e.nodeId === bothArmsId)!.score.vector).toBeCloseTo(
    0.8,
    2
  ))

it('ranks a page found by both arms first', async () =>
  expect((await fused(0.5)).edges[0]!.nodeId).toBe(bothArmsId))

it('ranks by vector similarity when alpha is 1', async () =>
  expect((await fused(1)).edges.slice(0, 2).map((e) => e.nodeId)).toEqual([
    vectorOnlyId,
    bothArmsId
  ]))

it('passes stop-word dropping to the keyword arm', async () => {
  const query = 'what is the roadmap'
  const everyWord = {anyWordFallbackBelow: 0}
  const {edges} = await fused(0.5, {...everyWord, query, dropStopWords: true})
  expect(edges.find(({nodeId}) => nodeId === keywordOnlyId)?.score.keywordRank).toEqual(
    expect.any(Number)
  )
  const withStopWords = await fused(0.5, {...everyWord, query, dropStopWords: false})
  expect(withStopWords.edges.every(({score}) => score.keywordRank === null)).toBe(true)
})

it('drops stop words and falls back when no page has every word by default', async () => {
  const {edges} = await fused(0.5, {query: 'what is the roadmap planning'})
  expect(edges.find(({nodeId}) => nodeId === vectorOnlyId)?.score.keywordRank).toEqual(
    expect.any(Number)
  )
})

it('gives pages with some of the words a keyword rank when the fallback applies', async () => {
  const vectorOnlyKeywordRank = async (anyWordFallbackBelow: number) => {
    const {edges} = await fused(0.5, {query: 'roadmap planning', anyWordFallbackBelow})
    return edges.find(({nodeId}) => nodeId === vectorOnlyId)?.score.keywordRank
  }
  expect(await vectorOnlyKeywordRank(1)).toEqual(expect.any(Number))
  expect(await vectorOnlyKeywordRank(0)).toBeNull()
})

it('ranks by keyword when alpha is 0', async () =>
  expect((await fused(0)).edges.at(-1)!.nodeId).toBe(vectorOnlyId))

it("never returns pages outside the viewer's access", async () =>
  expect((await fused(1)).edges.map((e) => e.nodeId)).not.toContain(otherUsersId))

it('never returns trashed pages', async () =>
  expect((await fused(0.5)).edges.map((e) => e.nodeId)).not.toContain(trashedId))

it('applies the date range to vector-only pages', async () => {
  const {edges} = await fused(0.5, {
    dateRange: {
      startAt: new Date('2000-01-01T00:00:00Z'),
      endAt: new Date('2000-12-31T00:00:00Z'),
      dateField: 'createdAt'
    }
  })
  expect(edges).toEqual([])
})

it('cuts the fused ranking to first, not each arm', async () =>
  expect((await fused(0.5, {first: 1})).edges.map((e) => e.nodeId)).toEqual([bothArmsId]))

it('ignores chunks whose similarity is not a number', async () => {
  const {edges} = await fused(0.5, {viewerId: otherUserId})
  expect(edges.map((e) => e.nodeId)).not.toContain(zeroChunkOnlyId)
  expect(edges.find((e) => e.nodeId === mixedChunksId)!.score.vector).toBeCloseTo(0.88, 2)
  expect(edges.every((e) => Number.isFinite(e.score.vector))).toBe(true)
})

it('breaks similarity ties by the most recent update', async () => {
  const ids = (await fused(1, {viewerId: otherUserId})).edges.map((e) => e.nodeId)
  expect(ids).toContain(olderTwinId)
  expect(ids.indexOf(newerTwinId)).toBe(ids.indexOf(olderTwinId) - 1)
})

it('applies the team filter to vector-only pages', async () =>
  expect((await fused(0.5, {teamIds: [teamId]})).edges.map((e) => e.nodeId)).toEqual([bothArmsId]))

it('uses the given similarity floor', async () => {
  const {edges} = await fused(0.5, {vectorFloor: 0.85})
  expect(edges.map((e) => e.nodeId).sort()).toEqual(
    [keywordOnlyId, bothArmsId, vectorOnlyId].sort()
  )
  expect(edges.find((e) => e.nodeId === bothArmsId)!.score.vectorRank).toBeNull()
})

it('ranks by vectors alone when the query has no keyword terms', async () => {
  const {edges} = await fused(0.5, {query: '!!'})
  expect(edges.map((e) => e.nodeId)).toEqual([vectorOnlyId, bothArmsId])
  expect(edges.every((e) => e.snippets.length === 0 && e.score.keywordRank === null)).toBe(true)
})

it('returns plain numbers and no next page', async () => {
  const {edges, pageInfo} = await fused(0.5)
  expect(typeof edges[0]!.score.combined).toBe('number')
  expect(typeof edges[0]!.score.vector).toBe('number')
  expect(pageInfo.hasNextPage).toBe(false)
  expect(pageInfo.hasPreviousPage).toBe(false)
  expect(decodePageSearchCursor(pageInfo.startCursor!)).toEqual({ranking: 'fused', position: 1})
  expect(decodePageSearchCursor(pageInfo.endCursor!)).toEqual({
    ranking: 'fused',
    position: edges.length
  })
})

it('pages through the fused ranking without gaps or repeats', async () => {
  const fullRanking = (await fused(0.5)).edges.map((e) => e.nodeId)
  const pagedRanking: typeof fullRanking = []
  let offset = 0
  let hasNextPage = true
  let requests = 0
  while (hasNextPage && requests < fullRanking.length + 1) {
    const {edges, pageInfo} = await fused(0.5, {first: 1, offset})
    requests++
    pagedRanking.push(...edges.map((e) => e.nodeId))
    hasNextPage = pageInfo.hasNextPage
    offset = decodePageSearchCursor(pageInfo.endCursor ?? '')?.position ?? offset
  }
  expect(fullRanking.length).toBeGreaterThan(1)
  expect(pagedRanking).toEqual(fullRanking)
  expect(requests).toBe(fullRanking.length)
})

it('pages past the first 100 keyword matches', async () => {
  const {edges, pageInfo} = await fused(0.5, {
    query: 'bulk',
    viewerId: bulkViewerId,
    offset: BULK_PAGE_COUNT - 1
  })
  expect(edges).toHaveLength(1)
  expect(edges[0]!.score.keywordRank).toBe(BULK_PAGE_COUNT)
  expect(pageInfo.hasNextPage).toBe(false)
})

it('returns every vector match when no page matches the words', async () => {
  const {edges, pageInfo} = await fused(0.5, {query: '!!', viewerId: bulkViewerId})
  expect(edges).toHaveLength(20)
  expect(pageInfo.hasNextPage).toBe(true)
})

it('pages past the first 100 vector matches', async () => {
  const {edges, pageInfo} = await fused(0.5, {
    query: '!!',
    viewerId: bulkViewerId,
    offset: BULK_PAGE_COUNT - 1
  })
  expect(edges).toHaveLength(1)
  expect(edges[0]!.score.vectorRank).toBe(BULK_PAGE_COUNT)
  expect(pageInfo.hasNextPage).toBe(false)
})

it('returns an empty page past the end', async () => {
  const resultCount = (await fused(0.5)).edges.length
  const {edges, pageInfo} = await fused(0.5, {offset: resultCount})
  expect(edges).toEqual([])
  expect(pageInfo).toEqual({
    hasNextPage: false,
    hasPreviousPage: true,
    startCursor: null,
    endCursor: null
  })
})

const junkSearch = (overrides: Partial<Parameters<typeof getPagesByRRF>[0]> = {}) =>
  fused(0.25, {viewerId: junkViewerId, ...overrides})
const resultIds = ({edges}: Awaited<ReturnType<typeof getPagesByRRF>>) =>
  edges.map(({nodeId}) => nodeId)

it('leaves near-empty pages out of the vector arm', async () => {
  expect(resultIds(await junkSearch({vectorMinBytes: 0}))).toContain(nearEmptyId)
  expect(resultIds(await junkSearch())).not.toContain(nearEmptyId)
})

it('measures the minimum length in bytes, so short Japanese notes keep their vector matches', async () => {
  expect(resultIds(await junkSearch())).toContain(shortJapaneseId)
})

it('still finds a near-empty page by its keywords', async () => {
  const {edges} = await junkSearch()
  const edge = edges.find(({nodeId}) => nodeId === nearEmptyKeywordId)
  expect(edge?.score.keywordRank).toBe(1)
  expect(edge?.score.vectorRank).toBeNull()
})
