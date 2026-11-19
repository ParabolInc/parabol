import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import {buildGrantFilter} from '../graphql/public/fields/pages'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {sendPublic, signUp} from './common'

const pg = getKysely()

afterAll(async () => {
  await pg.destroy()
})

const CREATE_PAGE = `
  mutation CreatePage($teamId: ID) {
    createPage(teamId: $teamId) {
      page {
        id
      }
    }
  }
`

const createPage = async (cookie: string, teamId?: string) => {
  const res = await sendPublic({query: CREATE_PAGE, variables: {teamId}, cookie})
  expect(res.errors).toBeUndefined()
  return CipherId.fromClient(res.data.createPage.page.id as string)[0]
}

const setup = async () => {
  const {userId, cookie, orgId, teamId} = await signUp()
  const privatePageId = await createPage(cookie)
  const teamPageId = await createPage(cookie, teamId)
  const dataLoader = getNewDataLoader('resourceGrantsPersonal.test')
  const grantsFor = (personalGranted: boolean) =>
    new ResourceGrants(userId, [orgId], [], null, dataLoader, personalGranted)
  return {userId, orgId, privatePageId, teamPageId, dataLoader, grantsFor}
}

const visiblePageIds = async (grants: ResourceGrants, pageIds: number[]) => {
  const criteria = grants.getPageGrantCriteria()
  const rows = await pg
    .selectFrom('Page')
    .select('id')
    .where('id', 'in', pageIds)
    .$if(!!criteria, (qb) => qb.where((eb) => buildGrantFilter(eb, 'Page.id', criteria!)))
    .execute()
  return rows.map(({id}) => id).sort()
}

test('an org-limited grant with personal access reaches a private page', async () => {
  const {privatePageId, grantsFor, dataLoader} = await setup()
  expect(await grantsFor(true).hasPage(privatePageId)).toBe(true)
  dataLoader.dispose()
})

test('an org-limited grant without personal access does not', async () => {
  const {privatePageId, grantsFor, dataLoader} = await setup()
  expect(await grantsFor(false).hasPage(privatePageId)).toBe(false)
  dataLoader.dispose()
})

test('a team page in a granted org is reached either way', async () => {
  const {teamPageId, grantsFor, dataLoader} = await setup()
  expect(await grantsFor(true).hasPage(teamPageId)).toBe(true)
  expect(await grantsFor(false).hasPage(teamPageId)).toBe(true)
  dataLoader.dispose()
})

test('the pages list includes private pages only with personal access', async () => {
  const {privatePageId, teamPageId, grantsFor, dataLoader} = await setup()
  const both = [privatePageId, teamPageId].sort()
  expect(await visiblePageIds(grantsFor(true), both)).toContain(privatePageId)
  expect(await visiblePageIds(grantsFor(false), both)).not.toContain(privatePageId)
  dataLoader.dispose()
})

test('the pages list includes team pages of a granted org when no teams are granted', async () => {
  const {privatePageId, teamPageId, grantsFor, dataLoader} = await setup()
  expect(await visiblePageIds(grantsFor(false), [privatePageId, teamPageId])).toEqual([teamPageId])
  dataLoader.dispose()
})

test('a grant with no orgs, teams, pages or private access lists no pages', async () => {
  const {userId, privatePageId, teamPageId, dataLoader} = await setup()
  const nothing = new ResourceGrants(userId, [], [], null, dataLoader, false)
  expect(await visiblePageIds(nothing, [privatePageId, teamPageId])).toEqual([])
  dataLoader.dispose()
})

test('a token for every org but no pages lists the team pages it can open, not private ones', async () => {
  const {userId, privatePageId, teamPageId, dataLoader} = await setup()
  const everyOrgNoPages = new ResourceGrants(userId, null, null, [], dataLoader, false)
  expect(await everyOrgNoPages.hasPage(teamPageId)).toBe(true)
  expect(await everyOrgNoPages.hasPage(privatePageId)).toBe(false)
  expect(await visiblePageIds(everyOrgNoPages, [privatePageId, teamPageId])).toEqual([teamPageId])
  dataLoader.dispose()
})

test('personal access is separate from an unrestricted grant', async () => {
  const {grantsFor, dataLoader} = await setup()
  expect(grantsFor(true).isUnrestricted()).toBe(false)
  expect(grantsFor(true).hasPersonal()).toBe(true)
  expect(grantsFor(false).hasPersonal()).toBe(false)
  dataLoader.dispose()
})

test('the personal flag survives serialization', async () => {
  const {grantsFor, dataLoader} = await setup()
  expect(grantsFor(true).serialize().personalGranted).toBe(true)
  expect(grantsFor(false).serialize().personalGranted).toBe(false)
  dataLoader.dispose()
})
