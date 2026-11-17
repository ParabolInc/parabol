import {TiptapTransformer} from '@hocuspocus/transformer'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import * as Y from 'yjs'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import getPubSub from '../../getPubSub'
import getRedis from '../../getRedis'
import {createNewPage} from '../createNewPage'

jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: async () => {}}
}))
jest.mock('../../publishPageNotification', () => ({
  publishPageNotification: async () => {}
}))

const pg = getKysely()
const userId = `createNewPage|${generateUID()}`

const docJSON = (title: string): TipTapSerializedPageContent => ({
  type: 'doc',
  content: [{type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]}]
})

const docWithMap = (mapName: string, entries: Record<string, string>) => {
  const doc = TiptapTransformer.toYdoc(docJSON('Plan'), 'default', serverTipTapExtensions)
  const map = doc.getMap<string>(mapName)
  for (const [key, value] of Object.entries(entries)) map.set(key, value)
  return doc
}

const readMap = (state: Uint8Array, mapName: string) => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  return doc.getMap<string>(mapName).toJSON()
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Page Creator'
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

test('stores the given yDoc and derives title from content', async () => {
  const yDoc = Y.encodeStateAsUpdate(docWithMap('columnMeta', {r1: 'Alpha'}))
  const page = await createNewPage({userId, content: docJSON('Copy of Plan'), yDoc})
  const row = await pg
    .selectFrom('Page')
    .select(['yDoc', 'title'])
    .where('id', '=', page.id)
    .executeTakeFirstOrThrow()
  expect(row.title).toBe('Copy of Plan')
  expect(readMap(row.yDoc ?? new Uint8Array(), 'columnMeta')).toEqual({r1: 'Alpha'})
}, 30_000)

test('places a top-level page at the sortOrder hint', async () => {
  const page = await createNewPage({userId, content: docJSON('B'), sortOrder: 'a5'})
  expect(page.sortOrder).toBe('a5')
}, 30_000)
