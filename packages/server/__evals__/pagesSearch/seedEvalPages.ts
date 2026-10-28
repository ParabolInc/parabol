import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import fs from 'fs'
import path from 'path'
import {encodeStateAsUpdate} from 'yjs'
import {markdownToTipTap} from '../../../client/shared/tiptap/markdownToTipTap'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../embedder/getEmbeddingsTableName'
import {primeSupportedLanguages} from '../../../embedder/getSupportedLanguages'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {embedPage} from '../../../embedder/workflows/embedPage'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import getKysely from '../../postgres/getKysely'
import {updatePageAccessTable} from '../../postgres/updatePageAccessTable'
import {getPlaintextFromTipTap} from '../../utils/tiptap/getPlaintextFromTipTap'

export const EVAL_USER_ID = 'eval|pagesSearch'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const UPDATED_AT_FILE = 'updatedAt.json'

interface Fixture {
  key: string
  title: string
  plaintextContent: string
  content: JSONContent
  updatedAt?: Date
}

interface LivePage {
  id: number
  title: string | null
  plaintextContent: string | null
  updatedAt: Date
}

const parseFixture = (fileName: string): Fixture => {
  const {name: key, ext} = path.parse(fileName)
  const text = fs.readFileSync(path.join(FIXTURES_DIR, fileName), 'utf8')
  const content: JSONContent =
    ext === '.md' ? {type: 'doc', content: markdownToTipTap(text)} : JSON.parse(text)
  const {title, plaintextContent} = getPlaintextFromTipTap(content)
  return {key, title, plaintextContent, content}
}

const readUpdatedAtByKey = (fixtureKeys: Set<string>) => {
  const filePath = path.join(FIXTURES_DIR, UPDATED_AT_FILE)
  if (!fs.existsSync(filePath)) return new Map<string, Date>()
  const isoDateByKey: Record<string, string> = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return new Map<string, Date>(
    Object.entries(isoDateByKey).map(([key, isoDate]) => {
      const updatedAt = new Date(isoDate)
      if (!fixtureKeys.has(key)) {
        throw new Error(`${UPDATED_AT_FILE} lists ${key}, which is not a fixture`)
      }
      if (Number.isNaN(updatedAt.getTime())) {
        throw new Error(`${UPDATED_AT_FILE} has an invalid date for ${key}`)
      }
      return [key, updatedAt]
    })
  )
}

const loadFixtures = () => {
  const fileNames = fs
    .readdirSync(FIXTURES_DIR)
    .filter((fileName) => /\.(md|json)$/.test(fileName) && fileName !== UPDATED_AT_FILE)
    .sort()
  const fixtures = fileNames.map(parseFixture)
  if (fixtures.length === 0) throw new Error(`No fixtures found in ${FIXTURES_DIR}`)
  const keys = new Set<string>()
  const keyByTitle = new Map<string, string>()
  for (const {key, title} of fixtures) {
    if (keys.has(key)) throw new Error(`More than one fixture file is named ${key}`)
    if (!title) throw new Error(`Fixture ${key} has no title`)
    const keyWithSameTitle = keyByTitle.get(title)
    if (keyWithSameTitle) {
      throw new Error(`Fixtures ${keyWithSameTitle} and ${key} share the title "${title}"`)
    }
    keys.add(key)
    keyByTitle.set(title, key)
  }
  const updatedAtByKey = readUpdatedAtByKey(keys)
  return fixtures.map((fixture) => ({...fixture, updatedAt: updatedAtByKey.get(fixture.key)}))
}

const ensureEvalUser = () =>
  getKysely()
    .insertInto('User')
    .values({
      id: EVAL_USER_ID,
      email: 'pages-search-eval@example.com',
      picture: 'https://example.com/pic.png',
      preferredName: 'Pages Search Eval'
    })
    .onConflict((oc) => oc.doNothing())
    .execute()

const createPages = async (fixtures: Fixture[]) => {
  const pg = getKysely()
  await pg.deleteFrom('Page').where('userId', '=', EVAL_USER_ID).execute()
  const pageIdByFixture = new Map<string, number>()
  for (const [index, {key, title, plaintextContent, content, updatedAt}] of fixtures.entries()) {
    const yDoc = Buffer.from(
      encodeStateAsUpdate(TiptapTransformer.toYdoc(content, undefined, serverTipTapExtensions))
    )
    const {id: pageId} = await pg
      .insertInto('Page')
      .values({
        userId: EVAL_USER_ID,
        isPrivate: true,
        sortOrder: `a${index}`,
        yDoc,
        title,
        plaintextContent,
        updatedAt
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    await pg
      .insertInto('PageUserAccess')
      .values({userId: EVAL_USER_ID, pageId, role: 'owner'})
      .execute()
    await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    pageIdByFixture.set(key, pageId)
  }
  return pageIdByFixture
}

const getActivePagesTableName = () => {
  const tableName = getEmbeddingsPagesTableName(activeEmbeddingModelId)
  if (!tableName) throw new Error('AI_EMBEDDING_MODELS must name a known embedding model')
  return tableName
}

const getKeysWithoutEmbeddings = async (pageIdByFixture: Map<string, number>) => {
  const tableName = getActivePagesTableName()
  const indexedRows = await getKysely()
    .selectFrom(tableName)
    .select('pageId')
    .distinct()
    .where('pageId', 'in', [...pageIdByFixture.values()])
    .execute()
  const indexedPageIds = new Set(indexedRows.map(({pageId}) => pageId))
  return [...pageIdByFixture]
    .filter(([, pageId]) => !indexedPageIds.has(pageId))
    .map(([key]) => key)
}

const indexPages = async (pageIdByFixture: Map<string, number>) => {
  const modelId = activeEmbeddingModelId
  if (!modelId) throw new Error('AI_EMBEDDING_MODELS must name an embedding model')
  const tableName = getActivePagesTableName()
  await primeSupportedLanguages()
  const keysToIndex = new Set(await getKeysWithoutEmbeddings(pageIdByFixture))
  const dataLoader = getNewDataLoader('pagesSearchEval')
  const errorMessageByKey = new Map<string, string>()
  for (const [key, pageId] of pageIdByFixture) {
    if (!keysToIndex.has(key)) continue
    const result = await embedPage({dataLoader, data: {pageId, modelId}})
    if (result instanceof JobQueueError) {
      errorMessageByKey.set(key, result.message)
      await getKysely().deleteFrom(tableName).where('pageId', '=', pageId).execute()
    }
  }
  dataLoader.dispose()
  const keysWithoutRows = new Set(await getKeysWithoutEmbeddings(pageIdByFixture))
  const unindexed = [...pageIdByFixture.keys()].filter(
    (key) => errorMessageByKey.has(key) || keysWithoutRows.has(key)
  )
  if (unindexed.length > 0) {
    const reasons = unindexed.map((key) => `${key}: ${errorMessageByKey.get(key) ?? 'no chunks'}`)
    console.warn(`Fixtures that were not indexed:\n${reasons.join('\n')}`)
  }
  return unindexed
}

const getCurrentPageIds = (fixtures: Fixture[], livePages: LivePage[]) => {
  if (livePages.length !== fixtures.length) return undefined
  const livePageByTitle = new Map<string | null, LivePage>(
    livePages.map((livePage) => [livePage.title, livePage])
  )
  const pageIdByFixture = new Map<string, number>()
  for (const {key, title, plaintextContent, updatedAt} of fixtures) {
    const livePage = livePageByTitle.get(title)
    if (!livePage || livePage.plaintextContent !== plaintextContent) return undefined
    if (updatedAt && livePage.updatedAt.getTime() !== updatedAt.getTime()) return undefined
    pageIdByFixture.set(key, livePage.id)
  }
  return pageIdByFixture
}

export const seedEvalPages = async ({reseed}: {reseed: boolean}) => {
  const fixtures = loadFixtures()
  await ensureEvalUser()
  const livePages = await getKysely()
    .selectFrom('Page')
    .select(['id', 'title', 'plaintextContent', 'updatedAt'])
    .where('userId', '=', EVAL_USER_ID)
    .where('deletedAt', 'is', null)
    .execute()
  const currentPageIds = reseed ? undefined : getCurrentPageIds(fixtures, livePages)
  const pageIdByFixture = currentPageIds ?? (await createPages(fixtures))
  return {pageIdByFixture, unindexed: await indexPages(pageIdByFixture)}
}
