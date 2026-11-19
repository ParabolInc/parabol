import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import {buildGrantFilter} from '../graphql/public/fields/pages'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import {hasPersonalGrant} from '../graphql/public/rules/hasPersonalGrant'
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

test('personal access, not an unrestricted grant, is what the rule checks', async () => {
  const {grantsFor, dataLoader} = await setup()
  const run = (resourceGrants: ResourceGrants | undefined) =>
    hasPersonalGrant.resolve(
      {},
      {},
      {resourceGrants, _shield: {cache: {}}} as never,
      {} as never,
      {debug: true} as never
    )
  expect(grantsFor(true).isUnrestricted()).toBe(false)
  expect(grantsFor(true).hasPersonal()).toBe(true)
  expect(grantsFor(false).hasPersonal()).toBe(false)
  expect(await run(undefined)).toBe(true)
  expect(await run(grantsFor(true))).toBe(true)
  expect(await run(grantsFor(false))).toMatchObject({
    message: "This access token doesn't include your private pages and invitations",
    extensions: {code: 'FORBIDDEN'}
  })
  dataLoader.dispose()
})

test('the personal flag survives serialization', async () => {
  const {grantsFor, dataLoader} = await setup()
  expect(grantsFor(true).serialize().personalGranted).toBe(true)
  expect(grantsFor(false).serialize().personalGranted).toBe(false)
  dataLoader.dispose()
})
