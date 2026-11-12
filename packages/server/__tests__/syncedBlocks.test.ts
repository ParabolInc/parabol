import getKysely from '../postgres/getKysely'
import {updatePageAccessTable} from '../postgres/updatePageAccessTable'
import {CipherId} from '../utils/CipherId'
import {sendPublic, signUp} from './common'

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
