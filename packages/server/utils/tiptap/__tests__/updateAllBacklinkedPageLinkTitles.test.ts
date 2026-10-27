import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../CipherId'
import {canSeePageTitle} from '../canSeePageTitle'
import {updateAllBacklinkedPageLinkTitles} from '../hocusPocusHub'

const mockHandleEvent = jest.fn()
jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: (...args: unknown[]) => mockHandleEvent(...args)}
}))

const pg = getKysely()
const orgId = `backlinkOrg|${generateUID()}`
const teamId = `backlinkTeam|${generateUID()}`
const ownerId = `backlinkOwner|${generateUID()}`
const colleagueId = `backlinkColleague|${generateUID()}`
const guestId = `backlinkGuest|${generateUID()}`

const makePage = async (
  readerIds: string[],
  placement: {teamId?: string; parentPageId?: number}
) => {
  const {id} = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: '', ...placement})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageAccess')
    .values(readerIds.map((userId) => ({pageId: id, userId, role: 'viewer' as const})))
    .execute()
  return id
}
const makePrivatePage = (readerIds: string[]) => makePage(readerIds, {})

const makePublic = (pageId: number) =>
  pg
    .insertInto('PageExternalAccess')
    .values({pageId, email: '*', role: 'viewer', invitedBy: ownerId})
    .execute()

const linkPages = (fromPageIds: number[], toPageId: number) =>
  pg
    .insertInto('PageBacklink')
    .values(fromPageIds.map((fromPageId) => ({fromPageId, toPageId})))
    .execute()

const getRetitledPageIds = async (pageId: number) => {
  mockHandleEvent.mockClear()
  await updateAllBacklinkedPageLinkTitles({pageId, title: 'New title'})
  return mockHandleEvent.mock.calls
    .map(([, documentName]) => CipherId.fromClient(documentName)[0])
    .sort((a, b) => a - b)
}

const makeRestrictedTeamSubPage = async () => {
  const teamPageId = await makePage([ownerId, colleagueId], {teamId})
  return makePage([ownerId], {parentPageId: teamPageId})
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [ownerId, colleagueId, guestId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Backlink Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Backlink Team', orgId}).execute()
  await pg
    .insertInto('OrganizationUser')
    .values([ownerId, colleagueId].map((userId) => ({id: `${orgId}:${userId}`, orgId, userId})))
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('OrganizationUser').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', 'in', [ownerId, colleagueId, guestId]).execute()
  await pg.destroy()
})

test("sends a private page title to pages read only by members of its creator's org", async () => {
  const titledPageId = await makePrivatePage([ownerId])
  const ownersPageId = await makePrivatePage([ownerId])
  const colleaguesPageId = await makePrivatePage([colleagueId])
  const guestsPageId = await makePrivatePage([guestId])
  const mixedPageId = await makePrivatePage([ownerId, guestId])
  const publicPageId = await makePrivatePage([ownerId])
  await makePublic(publicPageId)
  await linkPages(
    [ownersPageId, colleaguesPageId, guestsPageId, mixedPageId, publicPageId],
    titledPageId
  )

  expect(await getRetitledPageIds(titledPageId)).toEqual([ownersPageId, colleaguesPageId])
})

test('sends a team page title to pages read only by members of its org', async () => {
  const titledPageId = await makeRestrictedTeamSubPage()
  const colleaguesPageId = await makePrivatePage([colleagueId])
  const guestsPageId = await makePrivatePage([guestId])
  const mixedPageId = await makePrivatePage([colleagueId, guestId])
  await linkPages([colleaguesPageId, guestsPageId, mixedPageId], titledPageId)

  expect(await getRetitledPageIds(titledPageId)).toEqual([colleaguesPageId])
})

test('stops sending a team page title once its reader leaves the org', async () => {
  const titledPageId = await makeRestrictedTeamSubPage()
  const colleaguesPageId = await makePrivatePage([colleagueId])
  await linkPages([colleaguesPageId], titledPageId)
  expect(await getRetitledPageIds(titledPageId)).toEqual([colleaguesPageId])

  await pg
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', orgId)
    .where('userId', '=', colleagueId)
    .execute()
  expect(await getRetitledPageIds(titledPageId)).toEqual([])
  await pg
    .updateTable('OrganizationUser')
    .set({removedAt: null})
    .where('orgId', '=', orgId)
    .where('userId', '=', colleagueId)
    .execute()
})

test('stops sending a title to a guest once they lose access', async () => {
  const titledPageId = await makePrivatePage([ownerId, guestId])
  const guestsPageId = await makePrivatePage([guestId])
  await linkPages([guestsPageId], titledPageId)
  expect(await getRetitledPageIds(titledPageId)).toEqual([guestsPageId])

  await pg
    .deleteFrom('PageAccess')
    .where('pageId', '=', titledPageId)
    .where('userId', '=', guestId)
    .execute()
  expect(await getRetitledPageIds(titledPageId)).toEqual([])
})

test('sends a public page title to every backlinked page', async () => {
  const titledPageId = await makePrivatePage([ownerId])
  await makePublic(titledPageId)
  const guestsPageId = await makePrivatePage([guestId])
  const publicPageId = await makePrivatePage([guestId])
  await makePublic(publicPageId)
  await linkPages([guestsPageId, publicPageId], titledPageId)

  expect(await getRetitledPageIds(titledPageId)).toEqual([guestsPageId, publicPageId])
})

test("lets readers, members of the page's org, and anyone on a public page see its title", async () => {
  const privatePageId = await makePrivatePage([ownerId])
  const teamSubPageId = await makeRestrictedTeamSubPage()
  const publicPageId = await makePrivatePage([ownerId])
  await makePublic(publicPageId)

  expect(await canSeePageTitle(ownerId, privatePageId)).toBe(true)
  expect(await canSeePageTitle(colleagueId, privatePageId)).toBe(true)
  expect(await canSeePageTitle(guestId, privatePageId)).toBe(false)
  expect(await canSeePageTitle(colleagueId, teamSubPageId)).toBe(true)
  expect(await canSeePageTitle(guestId, teamSubPageId)).toBe(false)
  expect(await canSeePageTitle(guestId, publicPageId)).toBe(true)
})
