import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import * as Y from 'yjs'
import appOrigin from '../../../../../../appOrigin'
import AuthToken from '../../../../../../database/types/AuthToken'
import {getNewDataLoader} from '../../../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../../../generateUID'
import getKysely from '../../../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../../../postgres/updatePageAccessTable'
import {CipherId} from '../../../../../../utils/CipherId'
import getPubSub from '../../../../../../utils/getPubSub'
import getRedis from '../../../../../../utils/getRedis'
import {ResourceGrants} from '../../../../ResourceGrants'
import {duplicatePageTree} from '../duplicatePageTree'

const mockAddedLinks: {documentName: string; payload: unknown}[] = []
const mockSideEffects: string[] = []
const mockOpenDocStates = new Map<string, Uint8Array>()
const mockReadOnlyIfOpenArgs: (boolean | undefined)[] = []
let mockAddLinkError: Error | null = null

const mockHandleEvent = async (
  name: string,
  documentName: string,
  payload: unknown,
  onlyIfOpen?: boolean
) => {
  if (name === 'readPageState') {
    mockReadOnlyIfOpenArgs.push(onlyIfOpen)
    const openState = mockOpenDocStates.get(documentName)
    return openState ? Buffer.from(openState).toString('base64') : undefined
  }
  if (name === 'addCanonicalPageLink') {
    mockAddedLinks.push({documentName, payload})
    mockSideEffects.push('addCanonicalPageLink')
    if (mockAddLinkError) throw mockAddLinkError
  }
  return undefined
}

jest.mock('../../../../../../hocusPocus', () => ({
  redisHocusPocus: {
    handleEvent: (name: string, documentName: string, payload: unknown, onlyIfOpen?: boolean) =>
      mockHandleEvent(name, documentName, payload, onlyIfOpen)
  }
}))
jest.mock('../../../../../../utils/publishPageNotification', () => ({
  publishPageNotification: async (pageId: number, type: string) => {
    mockSideEffects.push(`${type}:${pageId}`)
  }
}))
jest.mock('../../../../../../graphql/mutations/helpers/publishToEmbedder', () => ({
  publishToEmbedder: async () => {}
}))
jest.mock('../../hostUserAsset', () => ({
  hostUserAsset: async (
    parsedUrl: URL,
    _authToken: unknown,
    _scope: string,
    scopeCode: string
  ) => ({
    url: parsedUrl.href.replace(/\/Page\/\d+\//, `/Page/${scopeCode}/`)
  })
}))

const pg = getKysely()
const viewerId = `duplicatePageTree|${generateUID()}`
const authToken = new AuthToken({sub: viewerId, tms: []})
const dataLoader = getNewDataLoader('duplicatePageTree.test')
const privatePlacement = {kind: 'private', sortOrder: 'a0'} as const

const heading = (text: string): JSONContent => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const pageLink = (pageId: number, attrs: Record<string, unknown> = {}): JSONContent => ({
  type: 'pageLinkBlock',
  attrs: {pageCode: CipherId.encrypt(pageId), title: 'Sub-page', canonical: true, ...attrs}
})
const image = (src: string): JSONContent => ({type: 'imageBlock', attrs: {src}})

type PageFields = {
  isParentLinked?: boolean
  isDatabase?: boolean
  isSyncedBlock?: boolean
  isTrashed?: boolean
}

const insertPage = async (parentPageId: number | null, fields: PageFields = {}) => {
  const {isTrashed, ...flags} = fields
  const parent = parentPageId
    ? await pg
        .selectFrom('Page')
        .select('ancestorIds')
        .where('id', '=', parentPageId)
        .executeTakeFirstOrThrow()
    : null
  const {id} = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      sortOrder: '',
      isPrivate: true,
      parentPageId,
      ancestorIds: parent && parentPageId ? [...parent.ancestorIds, parentPageId] : [],
      ...flags,
      ...(isTrashed ? {deletedAt: new Date(), deletedBy: viewerId} : {})
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageUserAccess')
    .values({pageId: id, userId: viewerId, role: 'owner'})
    .execute()
  await updatePageAccessTable(pg, id, {skipDeleteOld: true})
  return id
}

const setDoc = async (pageId: number, content: JSONContent[], decorate?: (doc: Y.Doc) => void) => {
  const doc = TiptapTransformer.toYdoc({type: 'doc', content}, 'default', serverTipTapExtensions)
  decorate?.(doc)
  await pg
    .updateTable('Page')
    .set({yDoc: Buffer.from(Y.encodeStateAsUpdate(doc))})
    .where('id', '=', pageId)
    .execute()
}

const readDoc = async (pageId: number) => {
  const {yDoc} = await pg
    .selectFrom('Page')
    .select('yDoc')
    .where('id', '=', pageId)
    .executeTakeFirstOrThrow()
  const doc = new Y.Doc()
  Y.applyUpdate(doc, yDoc ?? new Uint8Array())
  return doc
}

const readContent = async (pageId: number): Promise<JSONContent[]> =>
  TiptapTransformer.fromYdoc(await readDoc(pageId), 'default').content ?? []

const readLinks = async (pageId: number) =>
  (await readContent(pageId))
    .filter((node) => node.type === 'pageLinkBlock')
    .map(({attrs}) => {
      const {pageCode, canonical, synced} = attrs ?? {}
      return {pageCode, canonical, ...(synced ? {synced} : {})}
    })

const selectChildren = (parentPageId: number) =>
  pg
    .selectFrom('Page')
    .select(['id', 'title', 'isDatabase'])
    .where('parentPageId', '=', parentPageId)
    .execute()

const countViewerPages = async () => {
  const {count} = await pg
    .selectFrom('Page')
    .select((eb) => eb.fn.countAll<string>().as('count'))
    .where('userId', '=', viewerId)
    .executeTakeFirstOrThrow()
  return Number(count)
}

const makeThreeLevelTree = async () => {
  const rootId = await insertPage(null)
  const childId = await insertPage(rootId)
  const grandchildId = await insertPage(childId)
  await setDoc(rootId, [heading('A'), pageLink(childId)])
  await setDoc(childId, [heading('B'), pageLink(grandchildId)])
  await setDoc(grandchildId, [heading('C')])
  return {rootId, childId, grandchildId}
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: viewerId,
      email: `${viewerId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Page Copier'
    })
    .execute()
})

beforeEach(() => {
  mockAddedLinks.length = 0
  mockSideEffects.length = 0
  mockOpenDocStates.clear()
  mockReadOnlyIfOpenArgs.length = 0
  mockAddLinkError = null
})

afterAll(async () => {
  dataLoader.dispose()
  await pg.deleteFrom('Page').where('userId', '=', viewerId).execute()
  await pg.deleteFrom('User').where('id', '=', viewerId).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

const duplicate = (
  sourcePageId: number,
  overrides: Partial<Parameters<typeof duplicatePageTree>[0]> = {}
) =>
  duplicatePageTree({
    viewerId,
    authToken,
    dataLoader,
    resourceGrants: null,
    sourcePageId,
    placement: privatePlacement,
    ...overrides
  })

const placeUnder = async (parentId: number, afterPageCode: number | null = null) => ({
  kind: 'parent' as const,
  parent: await pg
    .selectFrom('Page')
    .select(['id', 'ancestorIds', 'isPrivate'])
    .where('id', '=', parentId)
    .executeTakeFirstOrThrow(),
  afterPageCode
})

test('copies a three-level tree and maps canonical links', async () => {
  const {rootId} = await makeThreeLevelTree()
  const before = await countViewerPages()

  const copy = await duplicate(rootId)

  expect(await countViewerPages()).toBe(before + 3)
  expect(copy.title).toBe('Copy of A')
  expect(copy.parentPageId).toBeNull()
  const [rootHeading] = await readContent(copy.id)
  expect(rootHeading?.content?.[0]?.text).toBe('Copy of A')
  const [childCopy] = await selectChildren(copy.id)
  expect(childCopy?.title).toBe('B')
  const [grandchildCopy] = await selectChildren(childCopy!.id)
  expect(grandchildCopy?.title).toBe('C')
  expect(await readLinks(copy.id)).toEqual([
    {pageCode: CipherId.encrypt(childCopy!.id), canonical: true}
  ])
  expect(await readLinks(childCopy!.id)).toEqual([
    {pageCode: CipherId.encrypt(grandchildCopy!.id), canonical: true}
  ])
  const backlink = await pg
    .selectFrom('PageBacklink')
    .selectAll()
    .where('fromPageId', '=', copy.id)
    .where('toPageId', '=', childCopy!.id)
    .executeTakeFirst()
  expect(backlink).toBeDefined()
}, 30_000)

test('leaves unlinked sub-pages behind as references', async () => {
  const rootId = await insertPage(null)
  const unlinkedId = await insertPage(rootId, {isParentLinked: false})
  await setDoc(rootId, [heading('A'), pageLink(unlinkedId)])
  await setDoc(unlinkedId, [heading('Private notes')])
  const before = await countViewerPages()

  const copy = await duplicate(rootId)

  expect(await countViewerPages()).toBe(before + 1)
  expect(await readLinks(copy.id)).toEqual([
    {pageCode: CipherId.encrypt(unlinkedId), canonical: false}
  ])
  const backlink = await pg
    .selectFrom('PageBacklink')
    .selectAll()
    .where('fromPageId', '=', copy.id)
    .where('toPageId', '=', unlinkedId)
    .executeTakeFirst()
  expect(backlink).toBeDefined()
}, 30_000)

test('skips sub-pages the viewer has no access to', async () => {
  const rootId = await insertPage(null)
  const hiddenId = await insertPage(rootId)
  await pg
    .deleteFrom('PageAccess')
    .where('pageId', '=', hiddenId)
    .where('userId', '=', viewerId)
    .execute()
  await setDoc(rootId, [heading('A'), pageLink(hiddenId)])
  await setDoc(hiddenId, [heading('Hidden')])
  const before = await countViewerPages()

  const copy = await duplicate(rootId)

  expect(await countViewerPages()).toBe(before + 1)
  expect(await readLinks(copy.id)).toEqual([
    {pageCode: CipherId.encrypt(hiddenId), canonical: false}
  ])
}, 30_000)

test('a token with no team or page grants only copies what it can open', async () => {
  const orgId = `duplicatePageTree|${generateUID()}`
  await pg.insertInto('Organization').values({id: orgId, name: 'Duplicate Org'}).execute()
  const rootId = await insertPage(null)
  const childId = await insertPage(rootId)
  await pg
    .insertInto('PageOrganizationAccess')
    .values({pageId: rootId, orgId, role: 'viewer'})
    .execute()
  await setDoc(rootId, [heading('A'), pageLink(childId)])
  await setDoc(childId, [heading('Private child')])
  const resourceGrants = new ResourceGrants(viewerId, null, [], null, dataLoader)
  const before = await countViewerPages()

  const copy = await duplicate(rootId, {resourceGrants})

  expect(await countViewerPages()).toBe(before + 1)
  expect(await readLinks(copy.id)).toEqual([
    {pageCode: CipherId.encrypt(childId), canonical: false}
  ])
  await pg.deleteFrom('PageOrganizationAccess').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
}, 30_000)

test('skips trashed and synced-block descendants', async () => {
  const rootId = await insertPage(null)
  const trashedId = await insertPage(rootId, {isTrashed: true})
  const underTrashedId = await insertPage(trashedId)
  const syncedId = await insertPage(rootId, {isSyncedBlock: true})
  const keptId = await insertPage(rootId)
  await setDoc(rootId, [
    heading('A'),
    pageLink(trashedId),
    pageLink(syncedId, {synced: true, title: ''}),
    pageLink(keptId)
  ])
  await setDoc(trashedId, [heading('Trashed'), pageLink(underTrashedId)])
  await setDoc(underTrashedId, [heading('Under trashed')])
  await setDoc(syncedId, [heading('Synced')])
  await setDoc(keptId, [heading('Kept')])
  const before = await countViewerPages()

  const copy = await duplicate(rootId)

  expect(await countViewerPages()).toBe(before + 2)
  const children = await selectChildren(copy.id)
  expect(children.map(({title}) => title)).toEqual(['Kept'])
  expect(await readLinks(copy.id)).toEqual([
    {pageCode: CipherId.encrypt(trashedId), canonical: false},
    {pageCode: CipherId.encrypt(syncedId), canonical: false, synced: true},
    {pageCode: CipherId.encrypt(children[0]!.id), canonical: true}
  ])
}, 30_000)

test('keeps database rows', async () => {
  const rootId = await insertPage(null, {isDatabase: true})
  await setDoc(rootId, [heading('Roadmap')], (doc) => {
    doc.getArray<string>('columns').push(['c1'])
    doc.getArray<string>('rows').push(['r1'])
    doc.getMap('data').set('r1', Y.Array.from([{key: 'c1', val: 'Alpha'}]))
  })

  const copy = await duplicate(rootId)

  expect(copy.isDatabase).toBe(true)
  const copiedDoc = await readDoc(copy.id)
  expect(copiedDoc.getArray<string>('columns').toJSON()).toEqual(['c1'])
  expect(copiedDoc.getArray<string>('rows').toJSON()).toEqual(['r1'])
  const copiedRow = copiedDoc.getMap('data').get('r1')
  expect(copiedRow).toBeInstanceOf(Y.Array)
  expect(copiedDoc.getMap('data').toJSON()).toEqual({r1: [{key: 'c1', val: 'Alpha'}]})
}, 30_000)

test('re-hosts page-scoped images', async () => {
  const rootId = await insertPage(null)
  const sourceCode = CipherId.encrypt(rootId)
  const userScopedSrc = `${appOrigin}/assets/User/${viewerId}/assets/avatar.png`
  await setDoc(rootId, [
    heading('A'),
    image(`${appOrigin}/assets/Page/${sourceCode}/assets/pic.png`),
    image(userScopedSrc)
  ])

  const copy = await duplicate(rootId)

  const srcs = (await readContent(copy.id))
    .filter((node) => node.type === 'imageBlock')
    .map((node) => node.attrs?.src)
  expect(srcs).toEqual([
    `${appOrigin}/assets/Page/${CipherId.encrypt(copy.id)}/assets/pic.png`,
    userScopedSrc
  ])
}, 30_000)

test('places after the source link', async () => {
  const parentId = await insertPage(null)
  const sourceId = await insertPage(parentId)
  const childId = await insertPage(sourceId)
  await setDoc(parentId, [heading('Parent'), pageLink(sourceId)])
  await setDoc(sourceId, [heading('A'), pageLink(childId)])
  await setDoc(childId, [heading('B')])

  const copy = await duplicate(sourceId, {
    placement: await placeUnder(parentId, CipherId.encrypt(sourceId))
  })

  expect(copy.parentPageId).toBe(parentId)
  expect(mockSideEffects).toEqual(['addCanonicalPageLink', `CreatePagePayload:${copy.id}`])
  expect(mockAddedLinks).toEqual([
    {
      documentName: CipherId.toClient(parentId, 'page'),
      payload: {
        title: 'Copy of A',
        pageCode: CipherId.encrypt(copy.id),
        isDatabase: false,
        isSyncedBlock: false,
        append: false,
        afterPageCode: CipherId.encrypt(sourceId)
      }
    }
  ])
}, 30_000)

test('refuses trees over the cap', async () => {
  const {rootId} = await makeThreeLevelTree()
  const before = await countViewerPages()

  await expect(duplicate(rootId, {maxPages: 2})).rejects.toThrow(
    'This page has more than 2 pages inside it. Copy a smaller part of it.'
  )
  expect(await countViewerPages()).toBe(before)
}, 30_000)

test('keeps the copies when linking them into the parent fails', async () => {
  const parentId = await insertPage(null)
  const {rootId} = await makeThreeLevelTree()
  await setDoc(parentId, [heading('Parent')])
  mockAddLinkError = new Error('TIMEOUT')
  const before = await countViewerPages()

  const copy = await duplicate(rootId, {placement: await placeUnder(parentId)})

  expect(copy.parentPageId).toBe(parentId)
  expect(await countViewerPages()).toBe(before + 3)
  expect(mockSideEffects).toContain(`CreatePagePayload:${copy.id}`)
}, 30_000)

test('copies the sub-pages nested under a page the token was granted', async () => {
  const rootId = await insertPage(null)
  const childId = await insertPage(rootId)
  await setDoc(rootId, [heading('A'), pageLink(childId)])
  await setDoc(childId, [heading('Nested')])
  const resourceGrants = new ResourceGrants(
    viewerId,
    [],
    [],
    [CipherId.toClient(rootId, 'page')],
    dataLoader
  )
  const before = await countViewerPages()

  const copy = await duplicate(rootId, {resourceGrants})

  expect(await countViewerPages()).toBe(before + 2)
  const [childCopy] = await selectChildren(copy.id)
  expect(childCopy).toMatchObject({title: 'Nested'})
  expect(await readLinks(copy.id)).toEqual([
    {pageCode: CipherId.encrypt(childCopy!.id), canonical: true}
  ])
}, 30_000)

test('reads closed pages from the database without saving them', async () => {
  const {rootId, childId, grandchildId} = await makeThreeLevelTree()
  const sourceIds = [rootId, childId, grandchildId]
  const selectUpdatedAt = () =>
    pg
      .selectFrom('Page')
      .select(['id', 'updatedAt'])
      .where('id', 'in', sourceIds)
      .orderBy('id')
      .execute()
  const before = await selectUpdatedAt()

  const copy = await duplicate(rootId)

  expect(copy.title).toBe('Copy of A')
  expect(mockReadOnlyIfOpenArgs).toEqual([true, true, true])
  expect(await selectUpdatedAt()).toEqual(before)
}, 30_000)

test('copies an open page from its live doc', async () => {
  const rootId = await insertPage(null)
  await setDoc(rootId, [heading('Saved')])
  const liveDoc = TiptapTransformer.toYdoc(
    {type: 'doc', content: [heading('Live')]},
    'default',
    serverTipTapExtensions
  )
  mockOpenDocStates.set(CipherId.toClient(rootId, 'page'), Y.encodeStateAsUpdate(liveDoc))

  const copy = await duplicate(rootId)

  expect(copy.title).toBe('Copy of Live')
}, 30_000)

test('seeds a heading when the source was never saved', async () => {
  const rootId = await insertPage(null)

  const copy = await duplicate(rootId)

  expect(copy.title).toBe('Copy of Untitled')
  const [rootHeading] = await readContent(copy.id)
  expect(rootHeading?.type).toBe('heading')
  expect(rootHeading?.content?.[0]?.text).toBe('Copy of Untitled')
}, 30_000)
