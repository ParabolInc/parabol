import {sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import getKysely from '../../getKysely'
import {getPagesByRRF} from '../getPagesByRRF'

const pg = getKysely()
const suffix = `pbr-${Date.now()}`
const viewerId = `viewer-${suffix}`
const otherUserId = `other-${suffix}`
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

let keywordOnlyId: number
let vectorOnlyId: number
let bothArmsId: number
let belowFloorId: number
let otherUsersId: number

const makeUser = (id: string, preferredName: string) => ({
  id,
  email: `${id}@example.com`,
  picture: 'https://example.com/pic.png',
  preferredName
})

const insertPage = async (title: string, userId = viewerId) => {
  const {id} = await pg
    .insertInto('Page')
    .values({title, plaintextContent: '', userId, sortOrder: 'a0'})
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const insertChunks = (pageId: number, cosines: number[]) =>
  pg
    .insertInto(chunkTable)
    .values(
      cosines.map((cosine, chunkNumber) => ({
        pageId,
        chunkNumber,
        embedding: numberVectorToString(vectorWithCosine(cosine)),
        embedText: '',
        tsv: sql<string>`to_tsvector('simple', '')`,
        pageUpdatedAt: new Date()
      }))
    )
    .execute()

beforeAll(async () => {
  const {rows} = await sql<{
    chunkTable: string | null
  }>`select to_regclass(${`"${chunkTable}"`})::text as "chunkTable"`.execute(pg)
  expect(rows[0]!.chunkTable).not.toBeNull()
  await pg
    .insertInto('User')
    .values([makeUser(viewerId, 'Fusion Viewer'), makeUser(otherUserId, 'Fusion Other')])
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Fusion Search Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Fusion Team', orgId}).execute()
  keywordOnlyId = await insertPage('Quarterly roadmap')
  vectorOnlyId = await insertPage('Planning notes')
  bothArmsId = await insertPage('Roadmap review')
  belowFloorId = await insertPage('Lunch menu')
  otherUsersId = await insertPage('Roadmap secret', otherUserId)
  await pg
    .insertInto('PageAccess')
    .values([
      ...[keywordOnlyId, vectorOnlyId, bothArmsId, belowFloorId].map((pageId) => ({
        userId: viewerId,
        pageId,
        role: 'owner' as const
      })),
      {userId: otherUserId, pageId: otherUsersId, role: 'owner'}
    ])
    .execute()
  await pg
    .insertInto('PageTeamAccess')
    .values({pageId: bothArmsId, teamId, role: 'editor'})
    .execute()
  await insertChunks(vectorOnlyId, [0.9])
  await insertChunks(bothArmsId, [0.5, 0.8])
  await insertChunks(belowFloorId, [0.2])
  await insertChunks(otherUsersId, [0.95])
})

afterAll(async () => {
  await pg
    .deleteFrom(chunkTable)
    .where('pageId', 'in', (qb) =>
      qb.selectFrom('Page').select('id').where('userId', 'in', [viewerId, otherUserId])
    )
    .execute()
  await pg.deleteFrom('Team').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', 'in', [viewerId, otherUserId]).execute()
  await pg.destroy()
})

const fused = (alpha: number, overrides: Partial<Parameters<typeof getPagesByRRF>[0]> = {}) =>
  getPagesByRRF({
    query: 'roadmap',
    queryVector,
    alpha,
    k: 60,
    first: 20,
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

it('ranks by keyword when alpha is 0', async () =>
  expect((await fused(0)).edges.at(-1)!.nodeId).toBe(vectorOnlyId))

it("never returns pages outside the viewer's access", async () =>
  expect((await fused(1)).edges.map((e) => e.nodeId)).not.toContain(otherUsersId))

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
  expect(pageInfo).toEqual({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null
  })
})
