import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {encodeStateAsUpdate} from 'yjs'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../embedder/getEmbeddingsTableName'
import {primeSupportedLanguages} from '../../../embedder/getSupportedLanguages'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {embedPage} from '../../../embedder/workflows/embedPage'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'

jest.mock('../../../embedder/ai_models/ModelManager', () => ({
  __esModule: true,
  default: () => ({getEmbedder: () => mockEmbedder})
}))

const pg = getKysely()
const userId = `embedPageTest|${generateUID()}`
const unitVector = Array.from({length: 1024}, (_, index) => (index === 0 ? 1 : 0))
let pageId = 0
let inFlight = 0
let maxInFlight = 0

const mockEmbedder = {
  pagesTableName: getEmbeddingsPagesTableName(activeEmbeddingModelId)!,
  languages: ['en'],
  getEmbeddingWithTokens: jest.fn(
    async (): Promise<{embedding: number[]; tokens: number} | Error> => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 5))
      inFlight--
      return {embedding: unitVector, tokens: 7}
    }
  )
}

const sectionText = (name: string) =>
  `${name} notes cover planning, delivery and follow up for the team this week. `.repeat(12)

const doc = (third: string): JSONContent => ({
  type: 'doc',
  content: [
    {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Embed page test'}]},
    ...['Alpha', 'Beta', third].flatMap((name) => [
      {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: name}]},
      {type: 'paragraph', content: [{type: 'text', text: sectionText(name)}]}
    ])
  ]
})

const toYDoc = (content: JSONContent) =>
  Buffer.from(
    encodeStateAsUpdate(TiptapTransformer.toYdoc(content, undefined, serverTipTapExtensions))
  )

const insertPage = async (sortOrder: string) => {
  const {id} = await pg
    .insertInto('Page')
    .values({
      userId,
      sortOrder,
      title: 'Embed page test',
      plaintextContent: '',
      yDoc: toYDoc(doc('Gamma'))
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const insertPageWithContent = async (sortOrder: string, content: JSONContent) => {
  const {id} = await pg
    .insertInto('Page')
    .values({
      userId,
      sortOrder,
      title: 'Embed page test',
      plaintextContent: '',
      yDoc: toYDoc(content)
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const run = (targetPageId = pageId) =>
  embedPage({
    dataLoader: getNewDataLoader('embedPageTest'),
    data: {pageId: targetPageId, modelId: activeEmbeddingModelId!}
  })

const chunkTexts = async (targetPageId = pageId) => {
  const rows = await pg
    .selectFrom(mockEmbedder.pagesTableName)
    .select('embedText')
    .where('pageId', '=', targetPageId)
    .orderBy('chunkNumber')
    .execute()
  return rows.map(({embedText}) => embedText)
}

const chunkStamps = async (targetPageId = pageId) => {
  const rows = await pg
    .selectFrom(mockEmbedder.pagesTableName)
    .select('pageUpdatedAt')
    .where('pageId', '=', targetPageId)
    .orderBy('chunkNumber')
    .execute()
  return rows.map(({pageUpdatedAt}) => pageUpdatedAt.getTime())
}

const getPageUpdatedAt = async (targetPageId = pageId) => {
  const page = await pg
    .selectFrom('Page')
    .select('updatedAt')
    .where('id', '=', targetPageId)
    .executeTakeFirstOrThrow()
  return page.updatedAt.getTime()
}

beforeAll(async () => {
  await primeSupportedLanguages()
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Embed Page Tester'
    })
    .execute()
  pageId = await insertPage('a0')
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

it('embeds changed chunks one at a time', async () => {
  expect(await run()).not.toBeInstanceOf(JobQueueError)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(3)
  expect(maxInFlight).toBe(1)
  expect(await chunkTexts()).toEqual([
    expect.stringContaining('Alpha'),
    expect.stringContaining('Beta'),
    expect.stringContaining('Gamma')
  ])
})
it('writes an edited chunk to its own chunk number', async () => {
  await pg
    .updateTable('Page')
    .set({yDoc: toYDoc(doc('Delta'))})
    .where('id', '=', pageId)
    .execute()
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  await run()
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(1)
  expect(await chunkTexts()).toEqual([
    expect.stringContaining('Alpha'),
    expect.stringContaining('Beta'),
    expect.stringContaining('Delta')
  ])
})
it('logs the tokens a page took', async () => {
  const loggedPageId = await insertPage('a2')
  const log = jest.spyOn(Logger, 'log').mockImplementation(() => {})
  await run(loggedPageId)
  expect(log).toHaveBeenCalledWith(
    expect.stringMatching(new RegExp(`^embedPage ${loggedPageId}: .*21 tokens`))
  )
  log.mockRestore()
})
it('skips a page whose embedding is current', async () => {
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  expect(await run()).toBe(false)
  expect(mockEmbedder.getEmbeddingWithTokens).not.toHaveBeenCalled()
})
it('re-embeds only what a failed run missed', async () => {
  const failedRunPageId = await insertPage('a1')
  mockEmbedder.getEmbeddingWithTokens
    .mockResolvedValueOnce({embedding: unitVector, tokens: 7})
    .mockResolvedValueOnce({embedding: unitVector, tokens: 7})
    .mockResolvedValueOnce(new Error('embeddings server timed out'))
  expect(await run(failedRunPageId)).toBeInstanceOf(JobQueueError)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(3)
  expect(await chunkStamps(failedRunPageId)).toEqual([0, 0])

  mockEmbedder.getEmbeddingWithTokens.mockClear()
  expect(await run(failedRunPageId)).not.toBeInstanceOf(JobQueueError)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(1)
  const pageUpdatedAt = await getPageUpdatedAt(failedRunPageId)
  expect(await chunkStamps(failedRunPageId)).toEqual([pageUpdatedAt, pageUpdatedAt, pageUpdatedAt])
  expect(await chunkTexts(failedRunPageId)).toEqual([
    expect.stringContaining('Alpha'),
    expect.stringContaining('Beta'),
    expect.stringContaining('Gamma')
  ])
})

it('embeds a page in a language Postgres has no config for', async () => {
  const japanesePageId = await insertPageWithContent('a3', {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {level: 1},
        content: [{type: 'text', text: '会議メモ: リリース計画'}]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'リリースは来週の火曜日です。テストは月曜日までに終わらせます。'.repeat(3)
          }
        ]
      }
    ]
  })
  expect(await run(japanesePageId)).not.toBeInstanceOf(JobQueueError)
  expect((await chunkTexts(japanesePageId)).length).toBeGreaterThan(0)
})

it('makes no chunks for a page without text', async () => {
  const titleOnlyPageId = await insertPageWithContent('a4', {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Q4 planning (draft)'}]}
    ]
  })
  expect(await run(titleOnlyPageId)).not.toBeInstanceOf(JobQueueError)
  expect(await chunkTexts(titleOnlyPageId)).toEqual([])
})

it('embeds a page with one block whose stored content is broken', async () => {
  const brokenPageId = await insertPageWithContent('a5', {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Broken response page'}]},
      {
        type: 'responseBlock',
        attrs: {id: 'broken', preferredName: 'Lukas Becker', avatar: '', content: '{'}
      },
      {type: 'paragraph', content: [{type: 'text', text: sectionText('Alpha')}]}
    ]
  })
  expect(await run(brokenPageId)).not.toBeInstanceOf(JobQueueError)
  expect(await chunkTexts(brokenPageId)).toEqual([expect.stringContaining('Alpha notes')])
})
