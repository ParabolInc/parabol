import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import getKysely from '../postgres/getKysely'
import {updatePageAccessTable} from '../postgres/updatePageAccessTable'
import {CipherId} from '../utils/CipherId'
import {publishPageNotification as publishPageNotificationReal} from '../utils/publishPageNotification'
import {createNewPage} from '../utils/tiptap/createNewPage'
import {sendPublic, signUp} from './common'

jest.mock('../utils/publishPageNotification', () => ({
  publishPageNotification: jest.fn(async () => {})
}))
const publishPageNotification = jest.mocked(publishPageNotificationReal)

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
