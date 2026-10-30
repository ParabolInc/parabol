import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../embedder/getEmbeddingsTableName'
import {primeSupportedLanguages} from '../../../embedder/getSupportedLanguages'
import {numberVectorToString} from '../../../embedder/indexing/numberVectorToString'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {TipTapChunker} from '../../../embedder/TipTapChunker'
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

const pageDoc = (title: string, sections: string[]): JSONContent => ({
  type: 'doc',
  content: [
    {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]},
    ...sections.flatMap((name) => [
      {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: name}]},
      {type: 'paragraph', content: [{type: 'text', text: sectionText(name)}]}
    ])
  ]
})

const doc = (third: string) => pageDoc('Embed page test', ['Alpha', 'Beta', third])

const chunkPage = (content: JSONContent) =>
  new TipTapChunker({language: 'en'}).chunk(content as TipTapSerializedContent)

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

const chunkRows = (targetPageId: number) =>
  pg
    .selectFrom(mockEmbedder.pagesTableName)
    .select(['id', 'embedText'])
    .where('pageId', '=', targetPageId)
    .orderBy('chunkNumber')
    .execute()

const setContent = (targetPageId: number, content: JSONContent) =>
  pg
    .updateTable('Page')
    .set({yDoc: toYDoc(content)})
    .where('id', '=', targetPageId)
    .execute()

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

it('deletes the chunks of a page whose text is removed', async () => {
  const shrinkingPageId = await insertPageWithContent('a6', doc('Gamma'))
  await run(shrinkingPageId)
  expect(await chunkTexts(shrinkingPageId)).toHaveLength(3)
  await pg
    .updateTable('Page')
    .set({
      yDoc: toYDoc({
        type: 'doc',
        content: [
          {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Embed page test'}]}
        ]
      })
    })
    .where('id', '=', shrinkingPageId)
    .execute()
  expect(await run(shrinkingPageId)).not.toBeInstanceOf(JobQueueError)
  expect(await chunkTexts(shrinkingPageId)).toEqual([])
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

it('embeds only the section inserted at the top', async () => {
  const editedPageId = await insertPageWithContent('a7', doc('Gamma'))
  await run(editedPageId)
  const before = await chunkRows(editedPageId)
  const edited = pageDoc('Embed page test', ['Zeta', 'Alpha', 'Beta', 'Gamma'])
  await setContent(editedPageId, edited)
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  expect(await run(editedPageId)).not.toBeInstanceOf(JobQueueError)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(1)
  const after = await chunkRows(editedPageId)
  expect(after.map(({embedText}) => embedText).sort()).toEqual(
    chunkPage(edited)
      .map(({embeddingText}) => embeddingText)
      .sort()
  )
  expect(after.filter(({id}) => before.some((row) => row.id === id))).toHaveLength(3)
})

it('re-embeds the chunks of a renamed title', async () => {
  const renamedPageId = await insertPageWithContent('a8', doc('Gamma'))
  await run(renamedPageId)
  await setContent(renamedPageId, pageDoc('Renamed page', ['Alpha', 'Beta', 'Gamma']))
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  await run(renamedPageId)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(3)
  expect(await chunkTexts(renamedPageId)).toEqual([
    expect.stringMatching(/^Renamed page > Alpha\n/),
    expect.stringMatching(/^Renamed page > Beta\n/),
    expect.stringMatching(/^Renamed page > Gamma\n/)
  ])
})

it('re-embeds rows written before headers were stored, once', async () => {
  const legacyPageId = await insertPageWithContent('a9', doc('Gamma'))
  const legacyChunks = chunkPage(doc('Gamma'))
  await pg
    .insertInto(mockEmbedder.pagesTableName)
    .values(
      legacyChunks.map(({text}, chunkNumber) => ({
        embedText: text,
        tsv: sql<string>`to_tsvector('simple', ${text})`,
        embedding: numberVectorToString(unitVector),
        pageId: legacyPageId,
        chunkNumber,
        pageUpdatedAt: new Date(0)
      }))
    )
    .execute()
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  await run(legacyPageId)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(3)
  expect(await chunkTexts(legacyPageId)).toEqual(
    legacyChunks.map(({embeddingText}) => embeddingText)
  )
  await setContent(legacyPageId, doc('Delta'))
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  await run(legacyPageId)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(1)
})

it('leaves no rows behind when a page shrinks to one chunk', async () => {
  const shrinkingPageId = await insertPageWithContent('b0', doc('Gamma'))
  await run(shrinkingPageId)
  await setContent(shrinkingPageId, {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Embed page test'}]},
      {type: 'paragraph', content: [{type: 'text', text: 'Short now.'}]}
    ]
  })
  await run(shrinkingPageId)
  expect(await chunkTexts(shrinkingPageId)).toEqual(['Embed page test\n\nShort now.'])
})

it('keeps the old rows when an embed fails', async () => {
  const failingPageId = await insertPageWithContent('b1', doc('Gamma'))
  await run(failingPageId)
  const before = await chunkTexts(failingPageId)
  const renamed = pageDoc('Renamed again', ['Alpha', 'Beta', 'Gamma'])
  await setContent(failingPageId, renamed)
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  mockEmbedder.getEmbeddingWithTokens.mockResolvedValueOnce(
    new Error('embeddings server timed out')
  )
  expect(await run(failingPageId)).toBeInstanceOf(JobQueueError)
  expect(await chunkTexts(failingPageId)).toEqual(before)
  mockEmbedder.getEmbeddingWithTokens.mockClear()
  expect(await run(failingPageId)).not.toBeInstanceOf(JobQueueError)
  const fresh = chunkPage(renamed).map(({embeddingText}) => embeddingText)
  expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(fresh.length)
  expect((await chunkTexts(failingPageId)).sort()).toEqual(fresh.sort())
})

it('adds every chunk when a page grows past one chunk', async () => {
  const growingPageId = await insertPageWithContent('b2', {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Embed page test'}]},
      {type: 'paragraph', content: [{type: 'text', text: 'Short now.'}]}
    ]
  })
  await run(growingPageId)
  await setContent(growingPageId, doc('Gamma'))
  await run(growingPageId)
  expect((await chunkTexts(growingPageId)).sort()).toEqual(
    chunkPage(doc('Gamma'))
      .map(({embeddingText}) => embeddingText)
      .sort()
  )
})
