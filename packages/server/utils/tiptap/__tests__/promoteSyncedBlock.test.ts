import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import getPubSub from '../../getPubSub'
import getRedis from '../../getRedis'
import {announcePromotedBlock, promoteSyncedBlock, selectPromotionHost} from '../promoteSyncedBlock'

const mockHandleEvent = jest.fn(async (..._args: unknown[]) => {})
jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: (...args: unknown[]) => mockHandleEvent(...args)}
}))
jest.mock('../../CipherId', () => ({
  CipherId: {
    encrypt: (id: number) => id,
    decrypt: (code: number) => code,
    toClient: (id: number, type: string) => `${type}:${id}`
  }
}))

const pg = getKysely()
const promoteSync = async (blockPageId: number, excludedHostIds: number[]) => {
  const hostId = await pg
    .transaction()
    .execute((trx) => promoteSyncedBlock(trx, blockPageId, excludedHostIds))
  if (hostId !== null) announcePromotedBlock(hostId, blockPageId)
  return hostId
}
const viewerId = `promoteBlock|${generateUID()}`
const strangerId = `promoteStranger|${generateUID()}`

const makePage = async (
  isSyncedBlock = false,
  parentPageId: number | null = null,
  ownerId = viewerId
) => {
  const {id} = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: '', parentPageId, ancestorIds: [], isSyncedBlock})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageUserAccess')
    .values({pageId: id, userId: ownerId, role: 'owner'})
    .execute()
  await updatePageAccessTable(pg, id, {skipDeleteOld: true})
  return id
}

const linkBack = (fromPageId: number, toPageId: number, createdAt: string) =>
  pg
    .insertInto('PageBacklink')
    .values({fromPageId, toPageId, createdAt: new Date(createdAt)})
    .execute()

const trash = (pageId: number) =>
  pg.updateTable('Page').set({deletedAt: new Date()}).where('id', '=', pageId).execute()

const pageRow = (pageId: number) =>
  pg
    .selectFrom('Page')
    .select(['parentPageId', 'isParentLinked', 'ancestorIds'])
    .where('id', '=', pageId)
    .executeTakeFirstOrThrow()

const accessRows = async (pageId: number) => {
  const [user, team, org, ext, all] = await Promise.all([
    pg.selectFrom('PageUserAccess').selectAll().where('pageId', '=', pageId).execute(),
    pg.selectFrom('PageTeamAccess').selectAll().where('pageId', '=', pageId).execute(),
    pg.selectFrom('PageOrganizationAccess').selectAll().where('pageId', '=', pageId).execute(),
    pg.selectFrom('PageExternalAccess').selectAll().where('pageId', '=', pageId).execute(),
    pg.selectFrom('PageAccess').selectAll().where('pageId', '=', pageId).execute()
  ])
  return {user, team, org, ext, all}
}

let originalHost: number
let firstCopyHost: number
let secondCopyHost: number
let block: number

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [viewerId, strangerId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: 'Block Promoter'
      }))
    )
    .execute()
})

beforeEach(async () => {
  mockHandleEvent.mockClear()
  originalHost = await makePage()
  firstCopyHost = await makePage()
  secondCopyHost = await makePage()
  block = await makePage(true, originalHost)
  await pg
    .updateTable('Page')
    .set({isParentLinked: true, ancestorIds: [originalHost]})
    .where('id', '=', block)
    .execute()
  await linkBack(originalHost, block, '2026-01-01T00:00:00Z')
  await linkBack(secondCopyHost, block, '2026-01-03T00:00:00Z')
  await linkBack(firstCopyHost, block, '2026-01-02T00:00:00Z')
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', 'in', [viewerId, strangerId]).execute()
  await pg.deleteFrom('User').where('id', 'in', [viewerId, strangerId]).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

test('re-parents under the host placed first and keeps every access row', async () => {
  const before = await accessRows(block)
  expect(await promoteSync(block, [originalHost])).toBe(firstCopyHost)
  expect(await pageRow(block)).toMatchObject({
    parentPageId: firstCopyHost,
    isParentLinked: false,
    ancestorIds: [firstCopyHost]
  })
  expect(await accessRows(block)).toEqual(before)
  expect(mockHandleEvent).toHaveBeenCalledWith('markPageLinkCanonical', `page:${firstCopyHost}`, {
    pageCode: block
  })
}, 30_000)

test('skips a host whose editors cannot see the block', async () => {
  const forgedHost = await makePage(false, null, strangerId)
  await linkBack(forgedHost, block, '2025-12-01T00:00:00Z')
  expect(await promoteSync(block, [originalHost])).toBe(firstCopyHost)
  expect(await pageRow(block)).toMatchObject({parentPageId: firstCopyHost})
  await trash(firstCopyHost)
  await trash(secondCopyHost)
  await pg.updateTable('Page').set({parentPageId: originalHost}).where('id', '=', block).execute()
  expect(await promoteSync(block, [originalHost])).toBeNull()
  expect(await pageRow(block)).toMatchObject({parentPageId: originalHost})
}, 30_000)

test('finds no host for a trashed block', async () => {
  expect(await selectPromotionHost(pg, block, [originalHost])).toBe(firstCopyHost)
  await trash(block)
  expect(await selectPromotionHost(pg, block, [originalHost])).toBeNull()
  expect(await promoteSync(block, [originalHost])).toBeNull()
}, 30_000)

test('skips hosts in trash', async () => {
  await trash(firstCopyHost)
  expect(await promoteSync(block, [originalHost])).toBe(secondCopyHost)
}, 30_000)

test('returns null when every other host is excluded or trashed', async () => {
  await trash(secondCopyHost)
  expect(await promoteSync(block, [originalHost, firstCopyHost])).toBeNull()
  expect(await pageRow(block)).toMatchObject({parentPageId: originalHost})
  expect(mockHandleEvent).not.toHaveBeenCalled()
}, 30_000)

test('does nothing when the removed link was not in the block page parent', async () => {
  expect(await promoteSync(block, [secondCopyHost])).toBeNull()
  expect(await pageRow(block)).toMatchObject({parentPageId: originalHost, isParentLinked: true})
  expect(mockHandleEvent).not.toHaveBeenCalled()
}, 30_000)

test('never re-parents the block under one of its own descendants', async () => {
  await pg
    .updateTable('Page')
    .set({parentPageId: block, ancestorIds: [originalHost, block]})
    .where('id', 'in', [firstCopyHost, secondCopyHost])
    .execute()
  expect(await promoteSync(block, [originalHost])).toBeNull()
}, 30_000)

test('does nothing for a page that is not a synced block', async () => {
  await pg.updateTable('Page').set({isSyncedBlock: false}).where('id', '=', block).execute()
  expect(await promoteSync(block, [originalHost])).toBeNull()
  expect(await pageRow(block)).toMatchObject({parentPageId: originalHost, isParentLinked: true})
  expect(mockHandleEvent).not.toHaveBeenCalled()
}, 30_000)
