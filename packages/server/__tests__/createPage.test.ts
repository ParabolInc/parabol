import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {getUserTeams, sendPublic, signUp} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const CREATE_PAGE = `
  mutation CreatePage($teamId: ID, $parentPageId: ID) {
    createPage(teamId: $teamId, parentPageId: $parentPageId) {
      page {
        id
        parentPageId
      }
    }
  }
`

const PAGE_CONTENT = `
  query PageContent($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        content(format: json)
      }
    }
  }
`

const SHARE_PAGE = `
  mutation SharePage($pageId: ID!, $subjectId: ID!, $role: PageRoleEnum) {
    updatePageAccess(pageId: $pageId, subjectType: user, subjectId: $subjectId, role: $role) {
      page {
        id
      }
    }
  }
`

const ARCHIVE_PAGE = `
  mutation ArchivePage($pageId: ID!) {
    archivePage(pageId: $pageId, action: archive) {
      __typename
    }
  }
`

const CREATE_TOKEN = `
  mutation CreateToken($grantedOrgIds: [ID!], $grantedTeamIds: [ID!], $expiresAt: DateTime!) {
    createPersonalAccessToken(
      name: "agent"
      scopes: [PAGES_WRITE]
      expiresAt: $expiresAt
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
    ) {
      token
    }
  }
`

type Auth = {cookie: string} | {bearerToken: string}
type CreatePageArgs = {teamId?: string; parentPageId?: string}

const createPage = (auth: Auth, variables: CreatePageArgs = {}) =>
  sendPublic({query: CREATE_PAGE, variables, ...auth})

const createPageId = async (auth: Auth, variables: CreatePageArgs = {}) => {
  const res = await createPage(auth, variables)
  expect(res.errors).toBeUndefined()
  return res.data.createPage.page.id as string
}

const createToken = async (
  cookie: string,
  grants: {grantedOrgIds?: string[]; grantedTeamIds?: string[]} = {}
) => {
  const res = await sendPublic({
    query: CREATE_TOKEN,
    variables: {
      ...grants,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

type PageNode = {type: string; attrs?: Record<string, unknown>}

const readTopLevelNodes = async (cookie: string, pageId: string) => {
  const res = await sendPublic({query: PAGE_CONTENT, variables: {pageId}, cookie})
  expect(res.errors).toBeUndefined()
  return JSON.parse(res.data.public.page.content).content as PageNode[]
}

const countPages = async (userId: string) => {
  const {count} = await getKysely()
    .selectFrom('Page')
    .select(({fn}) => fn.countAll<number>().as('count'))
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
  return Number(count)
}

test('a page created inside another page is linked at the end of its parent', async () => {
  const {cookie} = await signUp()
  const parentId = await createPageId({cookie})
  const res = await createPage({cookie}, {parentPageId: parentId})
  expect(res.errors).toBeUndefined()
  const child = res.data.createPage.page
  expect(child.parentPageId).toBe(parentId)

  const nodes = await readTopLevelNodes(cookie, parentId)
  expect(nodes.at(-1)).toMatchObject({
    type: 'pageLinkBlock',
    attrs: {pageCode: CipherId.fromClient(child.id)[1], canonical: true}
  })
})

test('a page inside a page the viewer can only view is refused', async () => {
  const [owner, viewer] = await Promise.all([signUp(), signUp()])
  const parentId = await createPageId({cookie: owner.cookie})
  const shared = await sendPublic({
    query: SHARE_PAGE,
    variables: {pageId: parentId, subjectId: viewer.userId, role: 'viewer'},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()

  const before = await countPages(viewer.userId)
  const res = await createPage({cookie: viewer.cookie}, {parentPageId: parentId})
  expect(res.errors?.[0]).toMatchObject({
    message: 'Insufficient permission. User role: viewer Role required: editor',
    extensions: {code: 'FORBIDDEN'}
  })
  expect(await countPages(viewer.userId)).toBe(before)
})

test('a page cannot take both a team and a parent page', async () => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const parentId = await createPageId({cookie})
  const before = await countPages(userId)
  const res = await createPage({cookie}, {teamId, parentPageId: parentId})
  expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  expect(await countPages(userId)).toBe(before)
})

test('a page cannot be created inside a trashed page', async () => {
  const {cookie, userId} = await signUp()
  const parentId = await createPageId({cookie})
  const archived = await sendPublic({query: ARCHIVE_PAGE, variables: {pageId: parentId}, cookie})
  expect(archived.errors).toBeUndefined()
  const before = await countPages(userId)
  const res = await createPage({cookie}, {parentPageId: parentId})
  expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  expect(await countPages(userId)).toBe(before)
})

test('a page cannot be created inside Meeting Summaries', async () => {
  const {cookie, userId} = await signUp()
  const parentId = await createPageId({cookie})
  await getKysely()
    .updateTable('Page')
    .set({isMeetingTOC: true})
    .where('id', '=', CipherId.fromClient(parentId)[0])
    .execute()
  const before = await countPages(userId)
  const res = await createPage({cookie}, {parentPageId: parentId})
  expect(res.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  expect(await countPages(userId)).toBe(before)
})

test('a token limited to a team creates team pages but not private or nested pages', async () => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const teamPageId = await createPageId({cookie}, {teamId})
  const bearerToken = await createToken(cookie, {grantedOrgIds: [], grantedTeamIds: [teamId]})

  const teamPage = await createPage({bearerToken}, {teamId})
  expect(teamPage.errors).toBeUndefined()

  const before = await countPages(userId)
  const limitedToken = {
    message: 'This access token is limited to specific organizations, teams or pages',
    extensions: {code: 'FORBIDDEN'}
  }
  const privatePage = await createPage({bearerToken})
  expect(privatePage.errors?.[0]).toMatchObject(limitedToken)

  const nestedPage = await createPage({bearerToken}, {parentPageId: teamPageId})
  expect(nestedPage.errors?.[0]).toMatchObject(limitedToken)
  expect(await countPages(userId)).toBe(before)
})

test('a token with no grant limits creates private and nested pages', async () => {
  const {cookie} = await signUp()
  const bearerToken = await createToken(cookie)
  const parentId = await createPageId({bearerToken})
  const child = await createPage({bearerToken}, {parentPageId: parentId})
  expect(child.errors).toBeUndefined()
  expect(child.data.createPage.page.parentPageId).toBe(parentId)
})
