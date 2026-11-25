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
        parentPageId
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
  mutation CreateToken(
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(
      name: "agent"
      scopes: [PAGES_READ, PAGES_WRITE]
      expiresAt: $expiresAt
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
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
  grants: {grantedOrgIds?: string[]; grantedTeamIds?: string[]; grantedPageIds?: string[]} = {}
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

const readPage = async (auth: Auth, pageId: string) => {
  const res = await sendPublic({query: PAGE_CONTENT, variables: {pageId}, ...auth})
  expect(res.errors).toBeUndefined()
  return res.data.public.page as {parentPageId: string | null; content: string}
}

const readTopLevelNodes = async (cookie: string, pageId: string) =>
  JSON.parse((await readPage({cookie}, pageId)).content).content as PageNode[]

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

const limitedToken = {
  message: 'This access token is limited to specific organizations, teams or pages',
  extensions: {code: 'FORBIDDEN'}
}

test('a token limited to a team creates team pages and sub-pages but not private pages', async () => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const teamPageId = await createPageId({cookie}, {teamId})
  const bearerToken = await createToken(cookie, {grantedOrgIds: [], grantedTeamIds: [teamId]})

  const teamPage = await createPage({bearerToken}, {teamId})
  expect(teamPage.errors).toBeUndefined()

  const subPage = await createPage({bearerToken}, {parentPageId: teamPageId})
  expect(subPage.errors).toBeUndefined()
  const subPageId = subPage.data.createPage.page.id as string
  expect((await readPage({bearerToken}, subPageId)).parentPageId).toBe(teamPageId)

  const before = await countPages(userId)
  const privatePage = await createPage({bearerToken})
  expect(privatePage.errors?.[0]).toMatchObject(limitedToken)
  expect(await countPages(userId)).toBe(before)
})

test('a token limited to a team is refused a sub-page under a page outside the team', async () => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const privatePageId = await createPageId({cookie})
  const bearerToken = await createToken(cookie, {grantedOrgIds: [], grantedTeamIds: [teamId]})

  const before = await countPages(userId)
  const res = await createPage({bearerToken}, {parentPageId: privatePageId})
  expect(res.errors?.[0]).toMatchObject({
    message: 'PAT does not grant access to this page',
    extensions: {code: 'FORBIDDEN'}
  })
  expect(await countPages(userId)).toBe(before)
})

test('a token limited to an org creates sub-pages under its org pages', async () => {
  const {cookie, userId, orgId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const teamPageId = await createPageId({cookie}, {teamId})
  const bearerToken = await createToken(cookie, {grantedOrgIds: [orgId], grantedTeamIds: []})

  const subPageId = await createPageId({bearerToken}, {parentPageId: teamPageId})
  expect((await readPage({bearerToken}, subPageId)).parentPageId).toBe(teamPageId)
})

test('a token limited to pages is refused sub-pages, even under a page it can edit', async () => {
  const [owner, member] = await Promise.all([signUp(), signUp()])
  const editableId = await createPageId({cookie: member.cookie})
  const viewOnlyId = await createPageId({cookie: owner.cookie})
  const shared = await sendPublic({
    query: SHARE_PAGE,
    variables: {pageId: viewOnlyId, subjectId: member.userId, role: 'viewer'},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const bearerToken = await createToken(member.cookie, {
    grantedOrgIds: [],
    grantedTeamIds: [],
    grantedPageIds: [editableId, viewOnlyId]
  })

  const before = await countPages(member.userId)
  const underEditable = await createPage({bearerToken}, {parentPageId: editableId})
  expect(underEditable.errors?.[0]).toMatchObject({
    message: "An access token given specific pages can't create sub-pages",
    extensions: {code: 'FORBIDDEN'}
  })
  const underViewOnly = await createPage({bearerToken}, {parentPageId: viewOnlyId})
  expect(underViewOnly.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  const privatePage = await createPage({bearerToken})
  expect(privatePage.errors?.[0]).toMatchObject(limitedToken)
  expect(await countPages(member.userId)).toBe(before)
})

test('a token given both a team and a page is refused sub-pages with the same message', async () => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const editableId = await createPageId({cookie})
  const bearerToken = await createToken(cookie, {
    grantedOrgIds: [],
    grantedTeamIds: [teamId],
    grantedPageIds: [editableId]
  })

  const before = await countPages(userId)
  const res = await createPage({bearerToken}, {parentPageId: editableId})
  expect(res.errors?.[0]).toMatchObject({
    message: "An access token given specific pages can't create sub-pages",
    extensions: {code: 'FORBIDDEN'}
  })
  expect(await countPages(userId)).toBe(before)
})

test.each([
  ['a team-limited token with an empty parentPageId', 'team', {parentPageId: ''}],
  ['a page-limited token with an empty parentPageId', 'page', {parentPageId: ''}],
  ['a team-limited token with an empty teamId', 'team', {teamId: ''}],
  ['a page-limited token with an empty teamId', 'page', {teamId: ''}]
] as const)('%s is refused a private page', async (_name, limit, variables) => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const pageId = await createPageId({cookie})
  const bearerToken = await createToken(
    cookie,
    limit === 'team'
      ? {grantedOrgIds: [], grantedTeamIds: [teamId]}
      : {grantedOrgIds: [], grantedTeamIds: [], grantedPageIds: [pageId]}
  )

  const before = await countPages(userId)
  const res = await createPage({bearerToken}, variables)
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
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
