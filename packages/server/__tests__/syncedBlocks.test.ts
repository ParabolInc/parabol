import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {applyUpdate, Doc, encodeStateAsUpdate} from 'yjs'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import {updatePageAccessTable} from '../postgres/updatePageAccessTable'
import {CipherId} from '../utils/CipherId'
import encodeAuthToken from '../utils/encodeAuthToken'
import {publishPageNotification as publishPageNotificationReal} from '../utils/publishPageNotification'
import {createNewPage} from '../utils/tiptap/createNewPage'
import {selectUnsyncOutcomes} from '../utils/tiptap/selectUnsyncOutcomes'
import {getTestEmail, sendPublic, signUp} from './common'

jest.mock('../utils/publishPageNotification', () => ({
  publishPageNotification: jest.fn(async () => {})
}))
const publishPageNotification = jest.mocked(publishPageNotificationReal)

jest.setTimeout(30000)

const pg = getKysely()

afterAll(async () => {
  await pg.destroy()
})

const ARCHIVE_PAGE = `
  mutation ArchivePage($pageId: ID!, $action: ArchivePageActionEnum!) {
    archivePage(pageId: $pageId, action: $action) {
      action
    }
  }
`

const PAGES_QUERY = `
  query Pages($first: Int!, $parentPageId: ID, $textFilter: String, $isArchived: Boolean) {
    viewer {
      pages(
        first: $first
        parentPageId: $parentPageId
        textFilter: $textFilter
        isArchived: $isArchived
      ) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const makePage = async (
  ownerId: string,
  parentPageId: number | null = null,
  isSyncedBlock = false
) => {
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
      userId: ownerId,
      sortOrder: '',
      parentPageId,
      ancestorIds: parent ? [...parent.ancestorIds, parentPageId!] : [],
      isSyncedBlock
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageUserAccess')
    .values({pageId: id, userId: ownerId, role: 'owner'})
    .execute()
  await updatePageAccessTable(pg, id, {skipDeleteOld: true})
  return id
}

const seedSyncedBlock = async (userId: string) => {
  const originalHost = await makePage(userId)
  const copyHost = await makePage(userId)
  const block = await makePage(userId, originalHost, true)
  const now = Date.now()
  await pg
    .insertInto('PageBacklink')
    .values([
      {fromPageId: originalHost, toPageId: block, createdAt: new Date(now - 2000)},
      {fromPageId: copyHost, toPageId: block, createdAt: new Date(now - 1000)}
    ])
    .execute()
  return {originalHost, copyHost, block}
}

const archive = (cookie: string, pageId: number, action: 'archive' | 'delete' | 'restore') =>
  sendPublic({
    query: ARCHIVE_PAGE,
    variables: {pageId: CipherId.toClient(pageId, 'page'), action},
    cookie
  })

const pageRow = (pageId: number) =>
  pg
    .selectFrom('Page')
    .select(['parentPageId', 'isParentLinked', 'deletedAt'])
    .where('id', '=', pageId)
    .executeTakeFirst()

const accessRows = (pageId: number) =>
  pg.selectFrom('PageAccess').selectAll().where('pageId', '=', pageId).orderBy('userId').execute()

test('promotes synced blocks before deleting the host', async () => {
  const {userId, cookie} = await signUp()
  const {originalHost, copyHost, block} = await seedSyncedBlock(userId)
  const accessBefore = await accessRows(block)
  await archive(cookie, originalHost, 'archive')
  const res = await archive(cookie, originalHost, 'delete')
  expect(res.errors).toBeUndefined()
  expect(await pageRow(originalHost)).toBeUndefined()
  expect(await pageRow(block)).toMatchObject({parentPageId: copyHost, deletedAt: null})
  expect(await accessRows(block)).toEqual(accessBefore)
})

test('archiving a host leaves its synced block untrashed', async () => {
  const {userId, cookie} = await signUp()
  const {originalHost, block} = await seedSyncedBlock(userId)
  await archive(cookie, originalHost, 'archive')
  expect(await pageRow(originalHost)).toMatchObject({deletedAt: expect.any(Date)})
  expect(await pageRow(block)).toMatchObject({deletedAt: null})
})

test('promotes a block whose in-between page was trashed earlier', async () => {
  const {userId, cookie} = await signUp()
  const originalHost = await makePage(userId)
  const copyHost = await makePage(userId)
  const sub = await makePage(userId, originalHost)
  const block = await makePage(userId, sub, true)
  await pg
    .insertInto('PageBacklink')
    .values([
      {fromPageId: sub, toPageId: block, createdAt: new Date(Date.now() - 2000)},
      {fromPageId: copyHost, toPageId: block, createdAt: new Date(Date.now() - 1000)}
    ])
    .execute()
  await archive(cookie, sub, 'archive')
  await archive(cookie, originalHost, 'archive')
  const res = await archive(cookie, originalHost, 'delete')
  expect(res.errors).toBeUndefined()
  expect(await pageRow(sub)).toBeUndefined()
  expect(await pageRow(block)).toMatchObject({parentPageId: copyHost, deletedAt: null})
})

test('a refused delete changes nothing', async () => {
  const [{userId, cookie}, other] = await Promise.all([signUp(), signUp()])
  const {originalHost, block} = await seedSyncedBlock(userId)
  await makePage(other.userId, originalHost)
  await archive(cookie, originalHost, 'archive')
  const res = await archive(cookie, originalHost, 'delete')
  expect(res.errors?.[0]?.message).toBe(
    'This page has sub-pages you do not own, so it cannot be deleted'
  )
  expect(await pageRow(originalHost)).toBeDefined()
  expect(await pageRow(block)).toMatchObject({
    parentPageId: originalHost,
    isParentLinked: true,
    deletedAt: null
  })
})

test('a block with no other host is deleted with its page', async () => {
  const {userId, cookie} = await signUp()
  const host = await makePage(userId)
  const block = await makePage(userId, host, true)
  await pg.insertInto('PageBacklink').values({fromPageId: host, toPageId: block}).execute()
  await archive(cookie, host, 'archive')
  const res = await archive(cookie, host, 'delete')
  expect(res.errors).toBeUndefined()
  expect(await pageRow(block)).toBeUndefined()
})

test('a synced block nested under a promoted block stays under it', async () => {
  const {userId, cookie} = await signUp()
  const {originalHost, copyHost, block} = await seedSyncedBlock(userId)
  const nested = await makePage(userId, block, true)
  const otherHost = await makePage(userId)
  await pg
    .insertInto('PageBacklink')
    .values([
      {fromPageId: block, toPageId: nested, createdAt: new Date(Date.now() - 2000)},
      {fromPageId: otherHost, toPageId: nested, createdAt: new Date(Date.now() - 1000)}
    ])
    .execute()
  await archive(cookie, originalHost, 'archive')
  const res = await archive(cookie, originalHost, 'delete')
  expect(res.errors).toBeUndefined()
  expect(await pageRow(block)).toMatchObject({parentPageId: copyHost})
  expect(await pageRow(nested)).toMatchObject({parentPageId: block, deletedAt: null})
})

test('a trashed synced block is never treated as promotable', async () => {
  const [{userId, cookie}, other] = await Promise.all([signUp(), signUp()])
  const host = await makePage(userId)
  const copyHost = await makePage(userId)
  const block = await makePage(other.userId, host, true)
  await pg
    .insertInto('PageBacklink')
    .values([
      {fromPageId: host, toPageId: block},
      {fromPageId: copyHost, toPageId: block}
    ])
    .execute()
  await pg.updateTable('Page').set({deletedAt: new Date()}).where('id', '=', block).execute()
  await archive(cookie, host, 'archive')
  const res = await archive(cookie, host, 'delete')
  expect(res.errors?.[0]?.message).toBe(
    'This page has sub-pages you do not own, so it cannot be deleted'
  )
  expect(await pageRow(block)).toBeDefined()
})

test('still refuses to delete when another person owns a non-synced sub-page', async () => {
  const [{userId, cookie}, other] = await Promise.all([signUp(), signUp()])
  const host = await makePage(userId)
  await makePage(other.userId, host)
  await archive(cookie, host, 'archive')
  const res = await archive(cookie, host, 'delete')
  expect(res.errors?.[0]?.message).toBe(
    'This page has sub-pages you do not own, so it cannot be deleted'
  )
  expect(await pageRow(host)).toBeDefined()
})

const pageIds = async (cookie: string, variables: Record<string, unknown>) => {
  const res = await sendPublic({query: PAGES_QUERY, variables: {first: 50, ...variables}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data.viewer.pages.edges.map((edge: {node: {id: string}}) => edge.node.id)
}

const setTitle = (pageId: number, title: string) =>
  pg.updateTable('Page').set({title}).where('id', '=', pageId).execute()

test('the sidebar and link picker never list synced block pages', async () => {
  const {userId, cookie} = await signUp()
  const {originalHost, block} = await seedSyncedBlock(userId)
  const ordinary = await makePage(userId, originalHost)
  await setTitle(block, 'Escalation path')
  await setTitle(ordinary, 'Escalation notes')
  const blockId = CipherId.toClient(block, 'page')
  const ordinaryId = CipherId.toClient(ordinary, 'page')
  const children = await pageIds(cookie, {parentPageId: CipherId.toClient(originalHost, 'page')})
  expect(children).toContain(ordinaryId)
  expect(children).not.toContain(blockId)
  const filtered = await pageIds(cookie, {textFilter: 'Escalation'})
  expect(filtered).toContain(ordinaryId)
  expect(filtered).not.toContain(blockId)
})

test('trash still lists a trashed synced block page', async () => {
  const {userId, cookie} = await signUp()
  const {block} = await seedSyncedBlock(userId)
  await archive(cookie, block, 'archive')
  expect(await pageIds(cookie, {isArchived: true})).toContain(CipherId.toClient(block, 'page'))
})

test('creating a synced block page sends no CreatePagePayload, an ordinary child page does', async () => {
  const {userId} = await signUp()
  const host = await makePage(userId)
  const content = {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Block'}]},
      {type: 'paragraph'}
    ]
  } as TipTapSerializedPageContent
  publishPageNotification.mockClear()
  await createNewPage({content, parentPageId: host, userId, isSyncedBlock: true})
  expect(publishPageNotification).not.toHaveBeenCalled()
  await createNewPage({content, parentPageId: host, userId})
  expect(publishPageNotification).toHaveBeenCalledTimes(1)
  expect(publishPageNotification.mock.calls[0]![1]).toBe('CreatePagePayload')
})

const PLACEMENTS = `
  query SyncedBlockPlacements($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        syncedBlockPlacements {
          pages {
            isOriginal
            page {
              id
              title
              deletedAt
            }
          }
          hiddenCount
          successor {
            id
          }
        }
      }
    }
  }
`

const LINKED_PLACEMENTS = `
  query LinkedSyncedBlockPlacements($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        linkedPages {
          id
          syncedBlockPlacements {
            hiddenCount
          }
        }
      }
    }
  }
`

const CREATE_PAGE_TOKEN = `
  mutation CreatePageToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $grantedPageIds: [ID!]
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(
      name: $name
      scopes: $scopes
      grantedPageIds: $grantedPageIds
      expiresAt: $expiresAt
    ) {
      token
    }
  }
`

type Placement = {
  isOriginal: boolean
  page: {id: string; title: string | null; deletedAt: string | null}
}

const toClientIds = (ids: number[]) => ids.map((id) => CipherId.toClient(id, 'page'))

const placements = (auth: string | {bearerToken: string}, pageId: number) =>
  sendPublic({
    query: PLACEMENTS,
    variables: {pageId: CipherId.toClient(pageId, 'page')},
    ...(typeof auth === 'string' ? {cookie: auth} : auth)
  })

const seedPlacements = async (userId: string) => {
  const foreigner = await signUp()
  const originalHost = await makePage(userId)
  const copyB = await makePage(userId)
  const copyC = await makePage(userId)
  const foreignHost = await makePage(foreigner.userId)
  const block = await makePage(userId, originalHost, true)
  await Promise.all([
    setTitle(originalHost, 'Original host'),
    setTitle(copyB, 'Copy B'),
    setTitle(copyC, 'Copy C'),
    setTitle(foreignHost, 'Foreign host')
  ])
  const now = Date.now()
  await pg
    .insertInto('PageBacklink')
    .values([
      {fromPageId: originalHost, toPageId: block, createdAt: new Date(now - 4000)},
      {fromPageId: copyC, toPageId: block, createdAt: new Date(now - 3000)},
      {fromPageId: copyB, toPageId: block, createdAt: new Date(now - 2000)},
      {fromPageId: foreignHost, toPageId: block, createdAt: new Date(now - 1000)}
    ])
    .execute()
  return {block, originalHost, copyB, copyC, foreignHost}
}

test('lists openable hosts in placement order and counts the rest', async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, copyB, copyC} = await seedPlacements(userId)
  const res = await placements(cookie, block)
  expect(res.errors).toBeUndefined()
  const {pages, hiddenCount} = res.data.public.page.syncedBlockPlacements
  expect(pages.map((p: Placement) => p.page.id)).toEqual(toClientIds([originalHost, copyC, copyB]))
  expect(pages.map((p: Placement) => p.isOriginal)).toEqual([true, false, false])
  expect(hiddenCount).toBe(1)
})

test("counts hosts the viewer can't open without naming them", async () => {
  const {userId, cookie} = await signUp()
  const {block, foreignHost} = await seedPlacements(userId)
  const res = await placements(cookie, block)
  expect(res.errors).toBeUndefined()
  expect(res.data.public.page.syncedBlockPlacements.hiddenCount).toBe(1)
  expect(JSON.stringify(res)).not.toContain(CipherId.toClient(foreignHost, 'page'))
  expect(JSON.stringify(res)).not.toContain('Foreign host')
})

test("keeps the original's host when it is in Trash and drops trashed copies", async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, copyB, copyC} = await seedPlacements(userId)
  await pg
    .updateTable('Page')
    .set({deletedAt: new Date()})
    .where('id', 'in', [originalHost, copyC])
    .execute()
  const res = await placements(cookie, block)
  expect(res.errors).toBeUndefined()
  const {pages} = res.data.public.page.syncedBlockPlacements
  expect(pages.map((p: Placement) => p.page.id)).toEqual(toClientIds([originalHost, copyB]))
  expect(pages[0].page.deletedAt).not.toBeNull()
})

test('names the successor the server would promote', async () => {
  const {userId, cookie} = await signUp()
  const {block, copyC} = await seedPlacements(userId)
  const res = await placements(cookie, block)
  expect(res.errors).toBeUndefined()
  const {successor} = res.data.public.page.syncedBlockPlacements
  expect(successor).toEqual({id: CipherId.toClient(copyC, 'page')})
})

test("names no successor when the host the server would promote is one the viewer can't open", async () => {
  const [{userId, cookie}, foreigner] = await Promise.all([signUp(), signUp()])
  const originalHost = await makePage(userId)
  const foreignHost = await makePage(foreigner.userId)
  const copyB = await makePage(userId)
  const block = await makePage(userId, originalHost, true)
  await Promise.all([
    setTitle(originalHost, 'Original host'),
    setTitle(foreignHost, 'Foreign host'),
    setTitle(copyB, 'Copy B')
  ])
  await pg
    .insertInto('PageUserAccess')
    .values({pageId: block, userId: foreigner.userId, role: 'editor'})
    .execute()
  await updatePageAccessTable(pg, block, {skipDeleteOld: true})
  const now = Date.now()
  await pg
    .insertInto('PageBacklink')
    .values([
      {fromPageId: originalHost, toPageId: block, createdAt: new Date(now - 3000)},
      {fromPageId: foreignHost, toPageId: block, createdAt: new Date(now - 2000)},
      {fromPageId: copyB, toPageId: block, createdAt: new Date(now - 1000)}
    ])
    .execute()
  const res = await placements(cookie, block)
  expect(res.errors).toBeUndefined()
  const {successor, hiddenCount} = res.data.public.page.syncedBlockPlacements
  expect(successor).toBeNull()
  expect(hiddenCount).toBe(1)
  expect(JSON.stringify(res)).not.toContain(CipherId.toClient(foreignHost, 'page'))
  expect(JSON.stringify(res)).not.toContain('Foreign host')
})

test('is null for a viewer without access to the block', async () => {
  const [{userId}, stranger] = await Promise.all([signUp(), signUp()])
  const {block} = await seedPlacements(userId)
  const strangerHost = await makePage(stranger.userId)
  await pg.insertInto('PageBacklink').values({fromPageId: strangerHost, toPageId: block}).execute()
  const res = await sendPublic({
    query: LINKED_PLACEMENTS,
    variables: {pageId: CipherId.toClient(strangerHost, 'page')},
    cookie: stranger.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.public.page.linkedPages).toEqual([
    {id: CipherId.toClient(block, 'page'), syncedBlockPlacements: null}
  ])
})

test('is null for a page that is not a synced block', async () => {
  const {userId, cookie} = await signUp()
  const page = await makePage(userId)
  const res = await placements(cookie, page)
  expect(res.errors).toBeUndefined()
  expect(res.data.public.page.syncedBlockPlacements).toBeNull()
})

test("counts hosts a token doesn't grant as hidden", async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, copyC} = await seedPlacements(userId)
  const created = await sendPublic({
    query: CREATE_PAGE_TOKEN,
    variables: {
      name: 'placements token',
      scopes: ['PAGES_READ'],
      grantedPageIds: toClientIds([block, originalHost, copyC]),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(created.errors).toBeUndefined()
  const res = await placements({bearerToken: created.data.createPersonalAccessToken.token}, block)
  expect(res.errors).toBeUndefined()
  const {pages, hiddenCount} = res.data.public.page.syncedBlockPlacements
  expect(pages.map((p: Placement) => p.page.id)).toEqual(toClientIds([originalHost, copyC]))
  expect(hiddenCount).toBe(2)
})

const READER_PLACEMENTS = `
  query ReaderPlacements($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        syncedBlockPlacements {
          pages {
            hiddenReaderCount
            page {
              id
              access {
                public
              }
            }
          }
        }
      }
    }
  }
`

type ReaderPlacement = {
  hiddenReaderCount: number
  page: {id: string; access: {public: string | null}}
}

const readerPlacements = async (cookie: string, pageId: number) => {
  const res = await sendPublic({
    query: READER_PLACEMENTS,
    variables: {pageId: CipherId.toClient(pageId, 'page')},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const {pages} = res.data.public.page.syncedBlockPlacements as {pages: ReaderPlacement[]}
  return (id: number) => pages.find((p) => p.page.id === CipherId.toClient(id, 'page'))!
}

const shareWith = async (pageId: number, userId: string, role: 'viewer' | 'editor') => {
  await pg.insertInto('PageUserAccess').values({pageId, userId, role}).execute()
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
}

const shareByLink = async (pageId: number, invitedBy: string) => {
  await pg
    .insertInto('PageExternalAccess')
    .values({pageId, email: '*', role: 'viewer', invitedBy})
    .execute()
}

test('counts readers of a host who cannot open the block', async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, copyB} = await seedPlacements(userId)
  const reader = await signUp()
  await shareWith(copyB, reader.userId, 'viewer')
  const placementFor = await readerPlacements(cookie, block)
  expect(placementFor(originalHost).hiddenReaderCount).toBe(0)
  expect(placementFor(copyB).hiddenReaderCount).toBe(1)
})

test('counts nobody when the block itself is shared by link', async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, copyB, copyC} = await seedPlacements(userId)
  const reader = await signUp()
  await shareByLink(block, userId)
  await shareWith(copyB, reader.userId, 'viewer')
  const placementFor = await readerPlacements(cookie, block)
  expect([originalHost, copyB, copyC].map((id) => placementFor(id).hiddenReaderCount)).toEqual([
    0, 0, 0
  ])
})

test('a host shared by link reports it through access.public, not the count', async () => {
  const {userId, cookie} = await signUp()
  const {block, copyB} = await seedPlacements(userId)
  await shareByLink(copyB, userId)
  const placementFor = await readerPlacements(cookie, block)
  expect(placementFor(copyB).hiddenReaderCount).toBe(0)
  expect(placementFor(copyB).page.access.public).toBe('viewer')
})

test("marks a host shared by link while the block isn't", async () => {
  const {userId} = await signUp()
  const {block, originalHost, copyB, foreignHost} = await seedPlacements(userId)
  const reader = await signUp()
  await shareWith(copyB, reader.userId, 'editor')
  await shareByLink(copyB, userId)
  const outcomes = await selectUnsyncOutcomes(pg, block, [originalHost, copyB, foreignHost])
  expect(Object.fromEntries(outcomes)).toEqual({
    [originalHost]: {hiddenReaderCount: 0, isPublicWithoutBlock: false},
    [copyB]: {hiddenReaderCount: 1, isPublicWithoutBlock: true},
    [foreignHost]: {hiddenReaderCount: 1, isPublicWithoutBlock: false}
  })
  await shareByLink(block, userId)
  const outcomesWhenBlockIsPublic = await selectUnsyncOutcomes(pg, block, [copyB])
  expect(outcomesWhenBlockIsPublic.get(copyB)).toEqual({
    hiddenReaderCount: 0,
    isPublicWithoutBlock: false
  })
  expect((await selectUnsyncOutcomes(pg, block, [])).size).toBe(0)
})

test('counts a pending email invite on a host as a hidden reader', async () => {
  const {userId} = await signUp()
  const {block, copyB} = await seedPlacements(userId)
  const invite = (pageId: number) =>
    pg
      .insertInto('PageExternalAccess')
      .values({pageId, email: 'invitee@example.com', role: 'viewer', invitedBy: userId})
      .execute()
  await invite(copyB)
  expect((await selectUnsyncOutcomes(pg, block, [copyB])).get(copyB)).toEqual({
    hiddenReaderCount: 1,
    isPublicWithoutBlock: false
  })
  await invite(block)
  expect((await selectUnsyncOutcomes(pg, block, [copyB])).get(copyB)).toEqual({
    hiddenReaderCount: 0,
    isPublicWithoutBlock: false
  })
})

const UNSYNC = `
  mutation UnsyncSyncedBlock($pageId: ID!) {
    unsyncSyncedBlock(pageId: $pageId) {
      page {
        id
      }
    }
  }
`

const unsync = (cookie: string, pageId: number) =>
  sendPublic({query: UNSYNC, variables: {pageId: CipherId.toClient(pageId, 'page')}, cookie})

const heading = (text: string) => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const syncedLink = (pageCode: number, canonical: boolean) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode, title: 'Escalation', synced: true, canonical}
})

const seedDoc = (pageId: number, content: JSONContent[]) =>
  pg
    .updateTable('Page')
    .set({
      yDoc: Buffer.from(
        encodeStateAsUpdate(
          TiptapTransformer.toYdoc({type: 'doc', content}, 'default', serverTipTapExtensions)
        )
      )
    })
    .where('id', '=', pageId)
    .execute()

const readDoc = async (pageId: number) => {
  const {yDoc} = await pg
    .selectFrom('Page')
    .select('yDoc')
    .where('id', '=', pageId)
    .executeTakeFirstOrThrow()
  const doc = new Doc()
  if (yDoc) applyUpdate(doc, yDoc)
  return TiptapTransformer.fromYdoc(doc, 'default') as JSONContent
}

const pollUntil = async <T>(
  read: () => Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs = 20000
) => {
  const deadline = Date.now() + timeoutMs
  while (true) {
    const value = await read()
    if (predicate(value)) return value
    if (Date.now() > deadline) throw new Error(`Never settled: ${JSON.stringify(value)}`)
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

const waitForDoc = (pageId: number, predicate: (json: JSONContent) => boolean, timeoutMs = 20000) =>
  pollUntil(() => readDoc(pageId), predicate, timeoutMs)

let unsyncReader: ReturnType<typeof signUp> | undefined
const getUnsyncReader = () => {
  unsyncReader ??= signUp()
  return unsyncReader
}

const seedUnsync = async (ownerId: string) => {
  const reader = await getUnsyncReader()
  const [originalHost, openCopy, guardedCopy, linkedCopy] = await Promise.all([
    makePage(ownerId),
    makePage(ownerId),
    makePage(ownerId),
    makePage(ownerId)
  ])
  const block = await makePage(ownerId, originalHost, true)
  const pageCode = CipherId.encrypt(block)
  await Promise.all([
    seedDoc(block, [heading('Escalation'), paragraph('Sev 1')]),
    seedDoc(originalHost, [heading('Original host'), syncedLink(pageCode, true)]),
    seedDoc(openCopy, [heading('Open copy'), syncedLink(pageCode, false)]),
    seedDoc(guardedCopy, [heading('Guarded copy'), syncedLink(pageCode, false)]),
    seedDoc(linkedCopy, [heading('Linked copy'), syncedLink(pageCode, false)]),
    shareWith(guardedCopy, reader.userId, 'viewer'),
    shareByLink(linkedCopy, ownerId)
  ])
  const now = Date.now()
  await pg
    .insertInto('PageBacklink')
    .values(
      [originalHost, openCopy, guardedCopy, linkedCopy].map((fromPageId, idx) => ({
        fromPageId,
        toPageId: block,
        createdAt: new Date(now - 4000 + idx * 1000)
      }))
    )
    .execute()
  return {block, originalHost, openCopy, guardedCopy, linkedCopy}
}

const hasText = (json: JSONContent) => JSON.stringify(json).includes('Sev 1')
const hasLink = (json: JSONContent) => JSON.stringify(json).includes('pageLinkBlock')

test('gives readable hosts the text and removes the block where a reader cannot open it', async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, openCopy, guardedCopy} = await seedUnsync(userId)
  const res = await unsync(cookie, block)
  expect(res.errors).toBeUndefined()
  expect(res.data.unsyncSyncedBlock.page.id).toBe(CipherId.toClient(block, 'page'))
  await waitForDoc(originalHost, (json) => hasText(json) && !hasLink(json))
  await waitForDoc(openCopy, (json) => hasText(json) && !hasLink(json))
  await waitForDoc(guardedCopy, (json) => !hasText(json) && !hasLink(json))
  expect(JSON.stringify(await readDoc(openCopy))).not.toContain('Escalation')
  expect((await pageRow(block))?.deletedAt).not.toBeNull()
})

test("removes the block where the page is shared by link and the block isn't", async () => {
  const {userId, cookie} = await signUp()
  const {block, linkedCopy} = await seedUnsync(userId)
  const res = await unsync(cookie, block)
  expect(res.errors).toBeUndefined()
  await waitForDoc(linkedCopy, (json) => !hasText(json) && !hasLink(json))
})

test('leaves no synced link to the block on any host and promotes nothing', async () => {
  const {userId, cookie} = await signUp()
  const {block, originalHost, openCopy, guardedCopy, linkedCopy} = await seedUnsync(userId)
  const res = await unsync(cookie, block)
  expect(res.errors).toBeUndefined()
  for (const host of [originalHost, openCopy, guardedCopy, linkedCopy]) {
    await waitForDoc(host, (json) => !hasLink(json))
  }
  await pollUntil(
    () =>
      pg.selectFrom('PageBacklink').select('fromPageId').where('toPageId', '=', block).execute(),
    (rows) => rows.length === 0
  )
  expect(await pageRow(block)).toMatchObject({
    parentPageId: originalHost,
    deletedAt: expect.any(Date)
  })
})

test("refuses an editor who doesn't own the block", async () => {
  const [{userId}, editor] = await Promise.all([signUp(), signUp()])
  const {block} = await seedUnsync(userId)
  await shareWith(block, editor.userId, 'editor')
  const res = await unsync(editor.cookie, block)
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(await pageRow(block)).toMatchObject({deletedAt: null})
})

test('refuses a page that is not a synced block', async () => {
  const {userId, cookie} = await signUp()
  const page = await makePage(userId)
  const res = await unsync(cookie, page)
  expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  expect(await pageRow(page)).toMatchObject({deletedAt: null})
})

const LINKED_PAGE_TITLES = `
  query LinkedPageTitles($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        linkedPages {
          id
          title
        }
      }
    }
  }
`

const linkedPageTitles = async (bearerToken: string, pageId: number) => {
  const res = await sendPublic({
    query: LINKED_PAGE_TITLES,
    variables: {pageId: CipherId.toClient(pageId, 'page')},
    bearerToken
  })
  expect(res.errors).toBeUndefined()
  const linked = res.data.public.page.linkedPages as {id: string; title: string | null}[]
  return (id: number) => linked.find((page) => page.id === CipherId.toClient(id, 'page'))!
}

const seedHostWithBlock = async (userId: string) => {
  const host = await makePage(userId)
  const block = await makePage(userId, host, true)
  await pg.insertInto('PageBacklink').values({fromPageId: host, toPageId: block}).execute()
  return {host, block}
}

describe('linked page titles', () => {
  let readerId: string
  let readerToken: string
  let ownerId: string
  const insertUser = async (preferredName: string) => {
    const {id} = await pg
      .insertInto('User')
      .values({
        id: generateUID(),
        email: getTestEmail(),
        picture: '',
        preferredName,
        inactive: false
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    return id
  }
  beforeAll(async () => {
    ownerId = await insertUser('Block owner')
    readerId = await insertUser('Host reader')
    readerToken = encodeAuthToken(new AuthToken({sub: readerId, tms: []}))
  })

  test("redacts a synced block's title from a host reader", async () => {
    const {host, block} = await seedHostWithBlock(ownerId)
    await setTitle(block, 'Escalation')
    await shareWith(host, readerId, 'viewer')
    expect((await linkedPageTitles(readerToken, host))(block).title).toBeNull()
    await shareWith(block, readerId, 'viewer')
    expect((await linkedPageTitles(readerToken, host))(block).title).toBe('Escalation')
  })

  test('keeps ordinary page titles visible in linkedPages', async () => {
    const {host} = await seedHostWithBlock(ownerId)
    const child = await makePage(ownerId, host)
    await setTitle(child, 'Runbook')
    await pg.insertInto('PageBacklink').values({fromPageId: host, toPageId: child}).execute()
    await shareWith(host, readerId, 'viewer')
    expect((await linkedPageTitles(readerToken, host))(child).title).toBe('Runbook')
  })
})

const UPDATE_PAGE_ACCESS_SECTION = `
  mutation UpdatePageAccessSection($pageId: ID!, $subjectId: ID!) {
    updatePageAccess(pageId: $pageId, subjectType: user, subjectId: $subjectId, role: viewer) {
      pageSection
    }
  }
`

describe('page section after sharing', () => {
  let ownerId: string
  let ownerToken: string
  let granteeId: string
  const insertUser = async (preferredName: string) => {
    const {id} = await pg
      .insertInto('User')
      .values({
        id: generateUID(),
        email: getTestEmail(),
        picture: '',
        preferredName,
        inactive: false
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    return id
  }
  beforeAll(async () => {
    ownerId = await insertUser('Section owner')
    granteeId = await insertUser('Section grantee')
    ownerToken = encodeAuthToken(new AuthToken({sub: ownerId, tms: []}))
  })

  const share = async (pageId: number) => {
    const res = await sendPublic({
      query: UPDATE_PAGE_ACCESS_SECTION,
      variables: {
        pageId: CipherId.toClient(pageId, 'page'),
        subjectId: granteeId
      },
      bearerToken: ownerToken
    })
    expect(res.errors).toBeUndefined()
    return res.data.updatePageAccess.pageSection as string | null
  }

  test('a synced block page is placed in no sidebar section', async () => {
    const {block} = await seedHostWithBlock(ownerId)
    expect(await share(block)).toBeNull()
  })

  test('an ordinary child page still gets a section', async () => {
    const host = await makePage(ownerId)
    const child = await makePage(ownerId, host)
    expect(await share(child)).not.toBeNull()
  })
})

const EXPORT_TO_CONFLUENCE = `
  mutation ExportSyncedBlock($pageId: ID!, $teamId: ID!) {
    exportPagesToConfluence(
      pageId: $pageId
      teamId: $teamId
      includeSubPages: false
      cloudId: "cloud"
      spaceId: "space"
      spaceName: "Space"
    ) {
      pageExportId
    }
  }
`

describe('a synced block on its own', () => {
  let user: Awaited<ReturnType<typeof signUp>>
  beforeAll(async () => {
    user = await signUp()
  })

  test('restores only after the page it came from is restored', async () => {
    const {userId, cookie} = user
    const {originalHost, block} = await seedSyncedBlock(userId)
    await seedDoc(originalHost, [paragraph('Host')])
    await pg.updateTable('Page').set({title: 'Escalation'}).where('id', '=', block).execute()
    expect((await archive(cookie, block, 'archive')).errors).toBeUndefined()
    expect((await archive(cookie, originalHost, 'archive')).errors).toBeUndefined()
    const refused = await archive(cookie, block, 'restore')
    expect(refused.errors?.[0]).toMatchObject({
      message: 'Restore the page this block came from first',
      extensions: {code: 'CONFLICT'}
    })
    expect((await pageRow(block))?.deletedAt).not.toBeNull()
    expect((await archive(cookie, originalHost, 'restore')).errors).toBeUndefined()
    expect((await archive(cookie, block, 'restore')).errors).toBeUndefined()
    expect(await pageRow(block)).toMatchObject({parentPageId: originalHost, deletedAt: null})
    const doc = await waitForDoc(originalHost, hasLink)
    expect(JSON.stringify(doc)).toContain('"synced":true')
    expect(JSON.stringify(doc)).not.toContain('Escalation')
  })

  test('an ordinary sub-page whose parent is in Trash still restores to the top level', async () => {
    const {userId, cookie} = user
    const parent = await makePage(userId)
    const child = await makePage(userId, parent)
    await pg
      .updateTable('Page')
      .set({deletedAt: new Date()})
      .where('id', 'in', [parent, child])
      .execute()
    const res = await archive(cookie, child, 'restore')
    expect(res.errors).toBeUndefined()
    expect(await pageRow(child)).toMatchObject({parentPageId: null, deletedAt: null})
  })

  test('cannot be exported to Confluence by itself', async () => {
    const {userId, cookie, orgId, teamId} = user
    await pg
      .insertInto('FeatureFlagOwner')
      .values({featureName: 'ConfluenceExport', orgId})
      .execute()
    const {block} = await seedSyncedBlock(userId)
    const res = await sendPublic({
      query: EXPORT_TO_CONFLUENCE,
      variables: {pageId: CipherId.toClient(block, 'page'), teamId},
      cookie
    })
    expect(res.errors?.[0]).toMatchObject({
      message: 'Export a page this synced block is on instead',
      extensions: {code: 'BAD_USER_INPUT'}
    })
  })
})
