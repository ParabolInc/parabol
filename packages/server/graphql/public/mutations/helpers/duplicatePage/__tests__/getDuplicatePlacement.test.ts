import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {__START__, positionBetween} from 'parabol-client/shared/sortOrder'
import {getNewDataLoader} from '../../../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../../../generateUID'
import getKysely from '../../../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../../../postgres/updatePageAccessTable'
import {CipherId} from '../../../../../../utils/CipherId'
import getPubSub from '../../../../../../utils/getPubSub'
import getRedis from '../../../../../../utils/getRedis'
import {ResourceGrants} from '../../../../ResourceGrants'
import {getDuplicatePlacement} from '../getDuplicatePlacement'

const pg = getKysely()
const suffix = generateUID()
const viewerId = `dupPlace|viewer${suffix}`
const strangerId = `dupPlace|stranger${suffix}`
const orgId = `dupPlaceOrg${suffix}`
const ownTeamId = `dupPlaceOwn${suffix}`
const otherTeamId = `dupPlaceOther${suffix}`

type PageOverrides = {
  userId?: string
  sortOrder?: string
  parentPageId?: number | null
  teamId?: string | null
  isPrivate?: boolean
  isMeetingTOC?: boolean
  isTrashed?: boolean
  viewerRole?: 'owner' | 'editor' | 'commenter' | 'viewer'
}

const makePage = async ({
  userId = strangerId,
  sortOrder = 'a',
  parentPageId = null,
  teamId = null,
  isPrivate = false,
  isMeetingTOC = false,
  isTrashed = false,
  viewerRole
}: PageOverrides = {}) => {
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
      userId,
      sortOrder,
      parentPageId,
      teamId,
      isPrivate,
      isMeetingTOC,
      ...(isTrashed ? {deletedAt: new Date(), deletedBy: userId} : {}),
      ancestorIds: parent ? [...parent.ancestorIds, parentPageId!] : []
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg.insertInto('PageUserAccess').values({pageId: id, userId, role: 'owner'}).execute()
  if (viewerRole && userId !== viewerId) {
    await pg
      .insertInto('PageUserAccess')
      .values({pageId: id, userId: viewerId, role: viewerRole})
      .execute()
  }
  await updatePageAccessTable(pg, id, {skipDeleteOld: true})
  return {id, parentPageId, teamId, isPrivate, userId, sortOrder}
}

const place = async (
  source: Awaited<ReturnType<typeof makePage>>,
  destinationPageId: number | null = null,
  grantedPageIds: number[] | null = null
) => {
  const dataLoader = getNewDataLoader('getDuplicatePlacement.test')
  const resourceGrants = grantedPageIds
    ? new ResourceGrants(
        viewerId,
        [],
        [],
        grantedPageIds.map((id) => CipherId.toClient(id, 'page')),
        dataLoader
      )
    : null
  const destination = destinationPageId
    ? await pg
        .selectFrom('Page')
        .select(['id', 'ancestorIds', 'isPrivate'])
        .where('id', '=', destinationPageId)
        .executeTakeFirstOrThrow()
    : null
  return getDuplicatePlacement({viewerId, source, destination, dataLoader, resourceGrants})
}

const expectTopOfPrivate = (placement: Awaited<ReturnType<typeof place>>) => {
  expect(placement.kind).toBe('private')
  expect(placement.kind === 'private' && placement.sortOrder).not.toBe(__START__)
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [viewerId, strangerId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Dup Place Org'}).execute()
  await pg
    .insertInto('Team')
    .values([
      {id: ownTeamId, name: 'Own Team', orgId},
      {id: otherTeamId, name: 'Other Team', orgId}
    ])
    .execute()
  await pg
    .insertInto('TeamMember')
    .values({id: TeamMemberId.join(ownTeamId, viewerId), teamId: ownTeamId, userId: viewerId})
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', 'in', [viewerId, strangerId]).execute()
  await pg.deleteFrom('TeamMember').where('teamId', 'in', [ownTeamId, otherTeamId]).execute()
  await pg.deleteFrom('Team').where('id', 'in', [ownTeamId, otherTeamId]).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', 'in', [viewerId, strangerId]).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

test('explicit destination wins', async () => {
  const parent = await makePage({viewerRole: 'editor'})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'editor'})
  const destination = await makePage({viewerRole: 'editor'})
  expect(await place(source, destination.id)).toMatchObject({
    kind: 'parent',
    parent: {id: destination.id},
    afterPageCode: null
  })
})

test('editable parent -> after the source link', async () => {
  const parent = await makePage({viewerRole: 'editor'})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'editor'})
  expect(await place(source)).toMatchObject({
    kind: 'parent',
    parent: {id: parent.id},
    afterPageCode: CipherId.encrypt(source.id)
  })
})

test('read-only parent -> top of Private', async () => {
  const parent = await makePage({viewerRole: 'viewer'})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'viewer'})
  expectTopOfPrivate(await place(source))
})

test('parent not granted to the token -> top of Private', async () => {
  const parent = await makePage({viewerRole: 'editor'})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'editor'})
  expectTopOfPrivate(await place(source, null, [source.id]))
})

test('parent granted to the token -> after the source link', async () => {
  const parent = await makePage({viewerRole: 'editor'})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'editor'})
  expect(await place(source, null, [source.id, parent.id])).toMatchObject({
    kind: 'parent',
    parent: {id: parent.id},
    afterPageCode: CipherId.encrypt(source.id)
  })
})

test('trashed parent -> top of Private', async () => {
  const parent = await makePage({viewerRole: 'editor', isTrashed: true})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'editor'})
  expectTopOfPrivate(await place(source))
})

test('meeting summary -> top of Private', async () => {
  const parent = await makePage({viewerRole: 'editor', isMeetingTOC: true})
  const source = await makePage({parentPageId: parent.id, viewerRole: 'editor'})
  expectTopOfPrivate(await place(source))
})

test('own team top-level -> same team, just after source', async () => {
  const source = await makePage({teamId: ownTeamId, sortOrder: 'a'})
  await makePage({teamId: ownTeamId, sortOrder: 'c'})
  await makePage({teamId: otherTeamId, sortOrder: 'b'})
  const placement = await place(source)
  expect(placement).toEqual({
    kind: 'team',
    teamId: ownTeamId,
    sortOrder: positionBetween('a', 'c')
  })
})

test('other team top-level -> top of Private', async () => {
  const source = await makePage({teamId: otherTeamId, viewerRole: 'editor'})
  expectTopOfPrivate(await place(source))
})

test('own private top-level -> just after source', async () => {
  const source = await makePage({userId: viewerId, isPrivate: true, sortOrder: 'm'})
  await makePage({userId: viewerId, isPrivate: true, sortOrder: 'p'})
  expect(await place(source)).toEqual({kind: 'private', sortOrder: positionBetween('m', 'p')})
})

test('own private top-level -> before a shared private page that follows it', async () => {
  const source = await makePage({userId: viewerId, isPrivate: true, sortOrder: 'r'})
  await makePage({isPrivate: true, sortOrder: 's', viewerRole: 'viewer'})
  await makePage({userId: viewerId, isPrivate: true, sortOrder: 't'})
  expect(await place(source)).toEqual({kind: 'private', sortOrder: positionBetween('r', 's')})
})
