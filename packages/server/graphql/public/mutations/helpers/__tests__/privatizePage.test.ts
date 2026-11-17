import generateUID from '../../../../../generateUID'
import getKysely from '../../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../../postgres/updatePageAccessTable'
import {privatizePage} from '../privatizePage'

const pg = getKysely()
const ownerId = `privatizeOwner|${generateUID()}`
const collaboratorId = `privatizeCollaborator|${generateUID()}`

const getRoles = async (pageId: number) => {
  const rows = await pg
    .selectFrom('PageAccess')
    .select(['userId', 'role'])
    .where('pageId', '=', pageId)
    .execute()
  return Object.fromEntries(rows.map(({userId, role}) => [userId, role]))
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [ownerId, collaboratorId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('User').where('id', 'in', [ownerId, collaboratorId]).execute()
  await pg.destroy()
})

test('moving a page to private removes everyone else from it and its sub-pages', async () => {
  const pageIds: number[] = []
  for (const parentPageId of [null, undefined]) {
    const {id} = await pg
      .insertInto('Page')
      .values({userId: ownerId, sortOrder: '', parentPageId: parentPageId ?? pageIds[0] ?? null})
      .returning('id')
      .executeTakeFirstOrThrow()
    pageIds.push(id)
    await pg
      .insertInto('PageUserAccess')
      .values([
        {pageId: id, userId: ownerId, role: 'owner'},
        {pageId: id, userId: collaboratorId, role: 'editor'}
      ])
      .execute()
    await updatePageAccessTable(pg, id)
  }
  const [pageId, subPageId] = pageIds as [number, number]
  expect(await getRoles(subPageId)).toEqual({[ownerId]: 'owner', [collaboratorId]: 'editor'})

  await privatizePage(ownerId, pageId, 'a0')

  expect(await getRoles(pageId)).toEqual({[ownerId]: 'owner'})
  expect(await getRoles(subPageId)).toEqual({[ownerId]: 'owner'})
}, 30_000)
