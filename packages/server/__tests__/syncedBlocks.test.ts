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
    .select(['parentPageId', 'deletedAt'])
    .where('id', '=', pageId)
    .executeTakeFirst()

test('promotes synced blocks before deleting the host', async () => {
  const {userId, cookie} = await signUp()
  const {originalHost, copyHost, block} = await seedSyncedBlock(userId)
  await archive(cookie, originalHost, 'archive')
  const res = await archive(cookie, originalHost, 'delete')
  expect(res.errors).toBeUndefined()
  expect(await pageRow(originalHost)).toBeUndefined()
  expect(await pageRow(block)).toMatchObject({parentPageId: copyHost, deletedAt: null})
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
