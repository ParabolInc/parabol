import {sql} from 'kysely'
import generateUID from '../../../generateUID'
import {movePageToTopLevel} from '../../../graphql/public/mutations/helpers/movePageToTopLevel'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {updatePageAncestorIds} from '../../../postgres/updatePageAncestorIds'
import getPubSub from '../../getPubSub'
import getRedis from '../../getRedis'
import {movePageToNewParent} from '../movePageToNewParent'

jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: async () => {}}
}))
jest.mock('../../publishPageNotification', () => ({
  publishPageNotification: async () => {}
}))
let mockAncestorUpdateError: Error | null = null
jest.mock('../../../postgres/updatePageAncestorIds', () => {
  const actual = jest.requireActual<typeof import('../../../postgres/updatePageAncestorIds')>(
    '../../../postgres/updatePageAncestorIds'
  )
  return {
    updatePageAncestorIds: async (...args: Parameters<typeof actual.updatePageAncestorIds>) => {
      if (mockAncestorUpdateError) throw mockAncestorUpdateError
      return actual.updatePageAncestorIds(...args)
    }
  }
})

const pg = getKysely()
const viewerId = `movePage|${generateUID()}`

const makePage = async (parentPageId: number | null = null) => {
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
      parentPageId,
      ancestorIds: parent ? [...parent.ancestorIds, parentPageId!] : []
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

const getAncestorIds = async (pageId: number) => {
  const {ancestorIds} = await pg
    .selectFrom('Page')
    .select('ancestorIds')
    .where('id', '=', pageId)
    .executeTakeFirstOrThrow()
  return ancestorIds
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: viewerId,
      email: `${viewerId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Page Mover'
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', viewerId).execute()
  await pg.deleteFrom('User').where('id', '=', viewerId).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

test('moving a page under a new parent updates the ancestors of everything under it', async () => {
  const newParentId = await makePage()
  const movedPageId = await makePage()
  const childId = await makePage(movedPageId)
  const grandchildId = await makePage(childId)

  await movePageToNewParent(viewerId, movedPageId, newParentId)

  expect(await getAncestorIds(movedPageId)).toEqual([newParentId])
  expect(await getAncestorIds(childId)).toEqual([newParentId, movedPageId])
  expect(await getAncestorIds(grandchildId)).toEqual([newParentId, movedPageId, childId])
}, 30_000)

test('refuses to move a page under a sub-page that arrived through an earlier move', async () => {
  const pageId = await makePage()
  const movedPageId = await makePage()
  const childId = await makePage(movedPageId)
  await movePageToNewParent(viewerId, movedPageId, pageId)

  await expect(movePageToNewParent(viewerId, pageId, childId)).rejects.toThrow('Circular reference')
}, 30_000)

test('moving a page to the top level updates the ancestors of everything under it', async () => {
  const rootId = await makePage()
  const movedPageId = await makePage(rootId)
  const childId = await makePage(movedPageId)

  await movePageToTopLevel(viewerId, movedPageId, 'a0')

  expect(await getAncestorIds(movedPageId)).toEqual([])
  expect(await getAncestorIds(childId)).toEqual([movedPageId])
}, 30_000)

test('stops walking when existing parent links form a loop', async () => {
  const firstId = await makePage()
  const secondId = await makePage(firstId)
  await pg.updateTable('Page').set({parentPageId: secondId}).where('id', '=', firstId).execute()

  await expect(updatePageAncestorIds(pg, firstId)).resolves.toBeUndefined()
}, 30_000)

test('rolls back a move that fails partway and leaves the page unlocked', async () => {
  const newParentId = await makePage()
  const movedPageId = await makePage()
  mockAncestorUpdateError = new Error('Ancestor update failed')
  await expect(movePageToNewParent(viewerId, movedPageId, newParentId)).rejects.toThrow(
    'Ancestor update failed'
  )
  mockAncestorUpdateError = null

  const movedPage = await pg.transaction().execute(async (trx) => {
    await sql`SET LOCAL lock_timeout = '2s'`.execute(trx)
    return trx
      .updateTable('Page')
      .set({title: 'Still editable'})
      .where('id', '=', movedPageId)
      .returning('parentPageId')
      .executeTakeFirstOrThrow()
  })
  expect(movedPage.parentPageId).toBeNull()
}, 30_000)
