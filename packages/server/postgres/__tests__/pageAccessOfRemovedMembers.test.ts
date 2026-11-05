import generateUID from '../../generateUID'
import getKysely from '../getKysely'
import {updatePageAccessTable} from '../updatePageAccessTable'

const pg = getKysely()
const ownerId = `pageAccessOwner|${generateUID()}`
const memberId = `pageAccessMember|${generateUID()}`
const orgId = `pageAccessOrg|${generateUID()}`
const teamId = `pageAccessTeam|${generateUID()}`

const makeSharedPage = async (share: {teamId?: string; orgId?: string}) => {
  const {id: pageId} = await pg
    .insertInto('Page')
    .values({userId: ownerId, sortOrder: ''})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg.insertInto('PageUserAccess').values({pageId, userId: ownerId, role: 'owner'}).execute()
  if (share.teamId) {
    await pg.insertInto('PageTeamAccess').values({pageId, teamId, role: 'editor'}).execute()
  }
  if (share.orgId) {
    await pg.insertInto('PageOrganizationAccess').values({pageId, orgId, role: 'editor'}).execute()
  }
  await updatePageAccessTable(pg, pageId)
  return pageId
}

const getMemberRole = async (pageId: number) => {
  const access = await pg
    .selectFrom('PageAccess')
    .select('role')
    .where('pageId', '=', pageId)
    .where('userId', '=', memberId)
    .executeTakeFirst()
  return access?.role ?? null
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      [ownerId, memberId].map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Page Access Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Page Access Team', orgId}).execute()
})

beforeEach(async () => {
  await pg.deleteFrom('TeamMember').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('OrganizationUser').where('orgId', '=', orgId).execute()
  await pg
    .insertInto('TeamMember')
    .values([ownerId, memberId].map((userId) => ({id: `${teamId}::${userId}`, teamId, userId})))
    .execute()
  await pg
    .insertInto('OrganizationUser')
    .values([ownerId, memberId].map((userId) => ({id: `${orgId}:${userId}`, orgId, userId})))
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', ownerId).execute()
  await pg.deleteFrom('TeamMember').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('OrganizationUser').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', 'in', [ownerId, memberId]).execute()
  await pg.destroy()
})

test('removing someone from a team revokes the access the team gave them', async () => {
  const pageId = await makeSharedPage({teamId})
  expect(await getMemberRole(pageId)).toBe('editor')

  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false})
    .where('id', '=', `${teamId}::${memberId}`)
    .execute()

  expect(await getMemberRole(pageId)).toBeNull()
})

test('removing someone from an org revokes the access the org gave them, and re-adding restores it', async () => {
  const pageId = await makeSharedPage({orgId})
  expect(await getMemberRole(pageId)).toBe('editor')

  await pg
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('id', '=', `${orgId}:${memberId}`)
    .execute()
  expect(await getMemberRole(pageId)).toBeNull()

  await pg
    .updateTable('OrganizationUser')
    .set({removedAt: null})
    .where('id', '=', `${orgId}:${memberId}`)
    .execute()
  expect(await getMemberRole(pageId)).toBe('editor')
})

test('leaving one team keeps access granted through the org', async () => {
  const pageId = await makeSharedPage({teamId, orgId})

  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false})
    .where('id', '=', `${teamId}::${memberId}`)
    .execute()

  expect(await getMemberRole(pageId)).toBe('editor')
})
