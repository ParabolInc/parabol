import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate, XmlElement} from 'yjs'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import type {PageChunkerName} from '../../../embedder/ai_models/AbstractEmbeddingsModel'
import {getEmbeddingsPagesTableName} from '../../../embedder/getEmbeddingsTableName'
import {primeSupportedLanguages} from '../../../embedder/getSupportedLanguages'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {SectionChunker} from '../../../embedder/SectionChunker'
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
  chunker: 'markdown' as PageChunkerName,
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
  `${name} notes cover planning, delivery and follow up for the team this week. `.repeat(40)

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

const sectionChunkerText = (name: string) =>
  `${name} notes cover planning, delivery and follow up for the team this week. `.repeat(12)

const pageDoc = (title: string, sections: string[]): JSONContent => ({
  type: 'doc',
  content: [
    {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]},
    ...sections.flatMap((name) => [
      {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: name}]},
      {type: 'paragraph', content: [{type: 'text', text: sectionChunkerText(name)}]}
    ])
  ]
})

const chunkPage = (content: JSONContent) =>
  new SectionChunker({language: 'en'}).chunk(content as TipTapSerializedContent)

const chunkRows = (targetPageId: number) =>
  pg
    .selectFrom(mockEmbedder.pagesTableName)
    .select(['id', 'chunkNumber', 'embedText'])
    .where('pageId', '=', targetPageId)
    .orderBy('chunkNumber')
    .execute()

const setContent = (targetPageId: number, content: JSONContent) =>
  pg
    .updateTable('Page')
    .set({yDoc: toYDoc(content)})
    .where('id', '=', targetPageId)
    .execute()

describe('with the sections chunker', () => {
  const threeSections = (third: string) => pageDoc('Embed page test', ['Alpha', 'Beta', third])

  beforeAll(() => {
    mockEmbedder.chunker = 'sections'
  })

  afterAll(() => {
    mockEmbedder.chunker = 'markdown'
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
    const shrinkingPageId = await insertPageWithContent('a6', threeSections('Gamma'))
    await run(shrinkingPageId)
    expect((await chunkTexts(shrinkingPageId)).length).toBeGreaterThan(0)
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
        {
          type: 'heading',
          attrs: {level: 1},
          content: [{type: 'text', text: 'Broken response page'}]
        },
        {
          type: 'responseBlock',
          attrs: {id: 'broken', preferredName: 'Lukas Becker', avatar: '', content: '{'}
        },
        {type: 'paragraph', content: [{type: 'text', text: sectionText('Alpha')}]}
      ]
    })
    expect(await run(brokenPageId)).not.toBeInstanceOf(JobQueueError)
    const brokenPageChunks = await chunkTexts(brokenPageId)
    expect(brokenPageChunks.length).toBeGreaterThan(0)
    expect(brokenPageChunks.join('\n')).toContain('Alpha notes')
    expect(brokenPageChunks.join('\n')).not.toContain('Lukas Becker')
  })

  it('keeps the language of a page holding a block type that no longer exists', async () => {
    const yDoc = TiptapTransformer.toYdoc(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "Nous travaillons sur la prochaine version avec toute l'équipe cette semaine. ".repeat(
                  3
                )
              }
            ]
          }
        ]
      },
      undefined,
      serverTipTapExtensions
    )
    yDoc.getXmlFragment('default').push([new XmlElement('blockTypeThatNoLongerExists')])
    const {id: frenchPageId} = await pg
      .insertInto('Page')
      .values({
        userId,
        sortOrder: 'a7',
        title: 'Page with a removed block type',
        plaintextContent: '',
        yDoc: Buffer.from(encodeStateAsUpdate(yDoc))
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    expect(await run(frenchPageId)).not.toBeInstanceOf(JobQueueError)
    const {tsv} = await pg
      .selectFrom(mockEmbedder.pagesTableName)
      .select(sql<string>`tsv::text`.as('tsv'))
      .where('pageId', '=', frenchPageId)
      .executeTakeFirstOrThrow()
    expect(tsv).toContain("'prochain'")
    expect(tsv).not.toContain("'nous'")
  })

  it('embeds only the section inserted at the top', async () => {
    const editedPageId = await insertPageWithContent('a7', threeSections('Gamma'))
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
    const renamedPageId = await insertPageWithContent('a8', threeSections('Gamma'))
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

  it('leaves no rows behind when a page shrinks to one chunk', async () => {
    const shrinkingPageId = await insertPageWithContent('b0', threeSections('Gamma'))
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
    const failingPageId = await insertPageWithContent('b1', threeSections('Gamma'))
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
    await setContent(growingPageId, threeSections('Gamma'))
    await run(growingPageId)
    expect((await chunkTexts(growingPageId)).sort()).toEqual(
      chunkPage(threeSections('Gamma'))
        .map(({embeddingText}) => embeddingText)
        .sort()
    )
  })

  it('writes readable text instead of markup', async () => {
    const readablePageId = await insertPageWithContent('a7', {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Embed page test'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Plain words', marks: [{type: 'bold'}]}]}
      ]
    })
    await run(readablePageId)
    expect(await chunkTexts(readablePageId)).toEqual([expect.stringContaining('Plain words')])
    expect((await chunkTexts(readablePageId))[0]).not.toContain('**')
  })
})

describe('with the markdown chunker', () => {
  it('keeps storing the chunk text without its header', async () => {
    const markdownPageId = await insertPageWithContent('a9', doc('Gamma'))
    await run(markdownPageId)
    const rows = await chunkRows(markdownPageId)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0]!.embedText).toContain('Alpha notes')
    expect(rows[0]!.embedText).not.toContain('Embed page test > Alpha')
  })

  it('embeds only the section that changed, by its text', async () => {
    const editedPageId = await insertPageWithContent('b0', doc('Gamma'))
    await run(editedPageId)
    const before = await chunkRows(editedPageId)
    mockEmbedder.getEmbeddingWithTokens.mockClear()
    await setContent(editedPageId, doc('Delta'))
    expect(await run(editedPageId)).not.toBeInstanceOf(JobQueueError)
    const after = await chunkRows(editedPageId)
    const kept = before.filter(({id}) => after.some((row) => row.id === id))
    expect(kept.length).toBeGreaterThan(0)
    expect(mockEmbedder.getEmbeddingWithTokens.mock.calls.length).toBeLessThan(after.length)
    expect(await chunkTexts(editedPageId)).toEqual([
      expect.stringContaining('Alpha'),
      expect.stringContaining('Beta'),
      expect.stringContaining('Delta')
    ])
  })

  it('re-embeds every chunk a new section shifts', async () => {
    const shiftedPageId = await insertPageWithContent('b3', doc('Gamma'))
    await run(shiftedPageId)
    const shifted = doc('Gamma')
    shifted.content!.splice(
      1,
      0,
      {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: 'Zeta'}]},
      {type: 'paragraph', content: [{type: 'text', text: sectionText('Zeta')}]}
    )
    await setContent(shiftedPageId, shifted)
    mockEmbedder.getEmbeddingWithTokens.mockClear()
    await run(shiftedPageId)
    expect(mockEmbedder.getEmbeddingWithTokens).toHaveBeenCalledTimes(4)
    expect(await chunkTexts(shiftedPageId)).toEqual([
      expect.stringContaining('Zeta'),
      expect.stringContaining('Alpha'),
      expect.stringContaining('Beta'),
      expect.stringContaining('Gamma')
    ])
  })

  it('still refuses a page in a language Postgres has no config for', async () => {
    const japanesePageId = await insertPageWithContent('a8', {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{type: 'text', text: 'リリースは来週の火曜日です。'.repeat(6)}]
        }
      ]
    })
    expect(await run(japanesePageId)).toBeInstanceOf(JobQueueError)
  })
})
