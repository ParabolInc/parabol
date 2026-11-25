import {CipherId} from '../utils/CipherId'
import {getUserTeams, HOST, PROTOCOL, signUp} from './common'
import {
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolError,
  expectToolErrorCode,
  listTools,
  PNG_BASE64
} from './mcpClient'

test('tools/list includes list_pages and upload_from_url', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const names = (await listTools(token)).map(({name}: {name: string}) => name)
  expect(names).toContain('list_pages')
  expect(names).toContain('upload_from_url')
})

test('create_page with no arguments makes a private page', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const created = await callToolForData(token, 'create_page', {})
  const page = await callToolForData(token, 'read_page', {pageId: created.createPage.page.id})
  expect(page.public.page.isPrivate).toBe(true)
  expect(page.public.page.teamId).toBeNull()
})

test('create_page with parentPageId nests the page and list_pages finds it', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ', 'PAGES_WRITE'], {
    cookie
  })
  const parent = await callToolForData(token, 'create_page', {})
  const parentPageId = parent.createPage.page.id
  const child = await callToolForData(token, 'create_page', {parentPageId})
  const childPageId = child.createPage.page.id
  const read = await callToolForData(token, 'read_page', {pageId: childPageId})
  expect(read.public.page.parentPageId).toBe(parentPageId)
  const listed = await callToolForData(token, 'list_pages', {parentPageId})
  const ids = listed.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id)
  expect(ids).toEqual([childPageId])
  expect(listed.viewer.pages.pageInfo.hasNextPage).toBe(false)
})

test('list_pages with no arguments returns top-level pages', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ', 'PAGES_WRITE'], {
    cookie
  })
  const parent = await callToolForData(token, 'create_page', {})
  const parentPageId = parent.createPage.page.id
  await callToolForData(token, 'create_page', {parentPageId})
  const listed = await callToolForData(token, 'list_pages', {})
  const ids = listed.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id)
  expect(ids).toEqual([parentPageId])
})

test('list_pages with a teamId returns top-level pages of that team', async () => {
  const {cookie, userId} = await signUp()
  const [{id: teamId}] = await getUserTeams(userId)
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ', 'PAGES_WRITE'], {
    cookie
  })
  const teamPage = await callToolForData(token, 'create_page', {teamId})
  const teamPageId = teamPage.createPage.page.id
  await callToolForData(token, 'create_page', {parentPageId: teamPageId})
  const listed = await callToolForData(token, 'list_pages', {teamId})
  const ids = listed.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id)
  expect(ids).toContain(teamPageId)
  expect(
    listed.viewer.pages.edges.every(
      ({node}: {node: {parentPageId: string | null}}) => node.parentPageId === null
    )
  ).toBe(true)
})

test('list_pages reports hasNextPage and a larger first returns every sub-page', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ', 'PAGES_WRITE'], {
    cookie
  })
  const parent = await callToolForData(token, 'create_page', {})
  const parentPageId = parent.createPage.page.id
  const childIds: string[] = []
  for (let i = 0; i < 3; i++) {
    const child = await callToolForData(token, 'create_page', {parentPageId})
    childIds.push(child.createPage.page.id)
  }
  const firstTwo = await callToolForData(token, 'list_pages', {parentPageId, first: 2})
  expect(firstTwo.viewer.pages.edges).toHaveLength(2)
  expect(firstTwo.viewer.pages.pageInfo.hasNextPage).toBe(true)
  const all = await callToolForData(token, 'list_pages', {parentPageId, first: 3})
  const ids = all.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id)
  expect([...ids].sort()).toEqual([...childIds].sort())
  expect(all.viewer.pages.pageInfo.hasNextPage).toBe(false)
})

test('upload_from_url copies an uploaded image into a page', async () => {
  const {cookie, userId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_WRITE', 'USERS_READ', 'PAGES_WRITE'], {
    cookie
  })
  const created = await callToolForData(token, 'create_page', {})
  const pageId = created.createPage.page.id as string
  const uploaded = await callToolForData(token, 'upload_image', {
    filename: 'a.png',
    mimeType: 'image/png',
    base64: PNG_BASE64,
    scope: 'User',
    scopeKey: userId
  })
  const sourceUrl = uploaded.uploadUserAsset.url as string
  const copied = await callToolForData(token, 'upload_from_url', {
    url: new URL(sourceUrl, `${PROTOCOL}://${HOST}`).toString(),
    scope: 'Page',
    scopeKey: pageId
  })
  expect(copied.embedUserAsset.url).toContain('/assets/Page/')
  expect(copied.embedUserAsset.url).not.toBe(sourceUrl)
  expect(copied.embedUserAsset.type).toBe('image/avif')
  expect(copied.embedUserAsset.size).toBeGreaterThan(0)
})

const SET_PAGE_JSON = `
  mutation SetPageJson($pageId: ID!, $content: String!) {
    editPageContent(pageId: $pageId, content: $content, format: json) {
      page {
        id
      }
    }
  }
`

const PAGE_JSON = `
  query PageJson($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        content(format: json)
      }
    }
  }
`

const setPageWithSubPage = (token: string, pageId: string, subPageId: string) =>
  callTool(token, 'graphql_mutate', {
    query: SET_PAGE_JSON,
    variables: {
      pageId,
      content: JSON.stringify({
        type: 'doc',
        content: [
          {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Plans'}]},
          {
            type: 'pageLinkBlock',
            attrs: {pageCode: CipherId.fromClient(subPageId)[1], title: 'Notes', canonical: true}
          }
        ]
      })
    }
  })

const readPlacement = async (token: string, pageId: string) => {
  const read = await callToolForData(token, 'read_page', {pageId})
  const {parentPageId, isPrivate} = read.public.page
  return {parentPageId, isPrivate} as {parentPageId: string | null; isPrivate: boolean}
}

const waitForParent = async (token: string, pageId: string, parentPageId: string) => {
  for (let attempt = 0; attempt < 50; attempt++) {
    if ((await readPlacement(token, pageId)).parentPageId === parentPageId) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Timed out waiting for the page to move')
}

test.each(['team', 'page'] as const)(
  'a %s-limited connection cannot make an existing page a sub-page by replacing page content',
  async (grant) => {
    const {cookie, teamId} = await signUp()
    const owner = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
    const parent = await callToolForData(owner, 'create_page', grant === 'team' ? {teamId} : {})
    const parentPageId = parent.createPage.page.id as string
    const outside = await callToolForData(owner, 'create_page', {})
    const outsidePageId = outside.createPage.page.id as string
    const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
      cookie,
      grantedOrgIds: [],
      grantedTeamIds: grant === 'team' ? [teamId] : [],
      grantedPageIds: grant === 'page' ? [parentPageId] : []
    })
    expectToolErrorCode(await setPageWithSubPage(token, parentPageId, outsidePageId), 'FORBIDDEN')
    expect(await readPlacement(owner, outsidePageId)).toEqual({parentPageId: null, isPrivate: true})
    expectToolError(
      await callTool(token, 'read_page', {pageId: outsidePageId}),
      'PAT does not grant access to this page'
    )
  }
)

test('a limited connection keeps the sub-pages a page already links when it replaces the page', async () => {
  const {cookie, teamId} = await signUp()
  const owner = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const parent = await callToolForData(owner, 'create_page', {teamId})
  const parentPageId = parent.createPage.page.id as string
  const child = await callToolForData(owner, 'create_page', {parentPageId})
  const childPageId = child.createPage.page.id as string
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedOrgIds: [],
    grantedTeamIds: [teamId],
    grantedPageIds: []
  })
  const replaced = await setPageWithSubPage(token, parentPageId, childPageId)
  expect(replaced.isError).toBeUndefined()
  await new Promise((resolve) => setTimeout(resolve, 500))
  expect((await readPlacement(owner, childPageId)).parentPageId).toBe(parentPageId)
  const read = await callToolForData(owner, 'graphql_query', {
    query: PAGE_JSON,
    variables: {pageId: parentPageId}
  })
  expect(JSON.parse(read.public.page.content).content).toContainEqual(
    expect.objectContaining({
      type: 'pageLinkBlock',
      attrs: expect.objectContaining({
        pageCode: CipherId.fromClient(childPageId)[1],
        canonical: true
      })
    })
  )
})

test('an unrestricted connection makes an existing page a sub-page by replacing page content', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const parent = await callToolForData(token, 'create_page', {})
  const parentPageId = parent.createPage.page.id as string
  const outside = await callToolForData(token, 'create_page', {})
  const outsidePageId = outside.createPage.page.id as string
  const replaced = await setPageWithSubPage(token, parentPageId, outsidePageId)
  expect(replaced.isError).toBeUndefined()
  await waitForParent(token, outsidePageId, parentPageId)
})
