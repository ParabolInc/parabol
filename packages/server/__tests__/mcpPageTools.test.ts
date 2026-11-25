import getKysely from '../postgres/getKysely'
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

type PageNode = {type: string; attrs?: Record<string, unknown>}

const pageCodeOf = (pageId: string) => CipherId.fromClient(pageId)[1]

const subPageLink = (pageId: string) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode: pageCodeOf(pageId), title: 'Notes', canonical: true}
})

const syncedPlacement = (blockCode: number) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode: blockCode, title: 'Escalation', synced: true}
})

const setPageJson = (token: string, pageId: string, links: PageNode[]) =>
  callTool(token, 'graphql_mutate', {
    query: SET_PAGE_JSON,
    variables: {
      pageId,
      content: JSON.stringify({
        type: 'doc',
        content: [
          {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Plans'}]},
          ...links
        ]
      })
    }
  })

const setPageWithSubPage = (token: string, pageId: string, subPageId: string) =>
  setPageJson(token, pageId, [subPageLink(subPageId)])

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

test('a limited connection cannot make an existing page a sub-page through markdown', async () => {
  const {cookie, teamId} = await signUp()
  const owner = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const parent = await callToolForData(owner, 'create_page', {teamId})
  const parentPageId = parent.createPage.page.id as string
  const outside = await callToolForData(owner, 'create_page', {})
  const outsidePageId = outside.createPage.page.id as string
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedOrgIds: [],
    grantedTeamIds: [teamId],
    grantedPageIds: []
  })
  const content = `# Plans\n\n:::pageLinkBlock {pageCode="${pageCodeOf(outsidePageId)}" title="Notes" canonical}\n:::`
  const result = await callTool(token, 'set_page_content', {pageId: parentPageId, content})
  expect(expectToolErrorCode(result, 'FORBIDDEN')).toContain(
    "can't make an existing page a sub-page"
  )
  expect(await readPlacement(owner, outsidePageId)).toEqual({parentPageId: null, isPrivate: true})
})

afterAll(async () => {
  await getKysely().destroy()
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const readPageNodes = async (token: string, pageId: string) => {
  const read = await callToolForData(token, 'graphql_query', {
    query: PAGE_JSON,
    variables: {pageId}
  })
  return JSON.parse(read.public.page.content).content as PageNode[]
}

const createSyncedBlock = async (token: string) => {
  const host = await callToolForData(token, 'create_page', {})
  const hostPageId = host.createPage.page.id as string
  const block = await callToolForData(token, 'create_page', {parentPageId: hostPageId})
  const [blockPageId, blockCode] = CipherId.fromClient(block.createPage.page.id)
  await getKysely()
    .updateTable('Page')
    .set({isSyncedBlock: true})
    .where('id', '=', blockPageId)
    .execute()
  const hostLink = {
    type: 'pageLinkBlock',
    attrs: {pageCode: blockCode, title: '', synced: true, canonical: true}
  }
  expect((await setPageJson(token, hostPageId, [hostLink])).isError).toBeUndefined()
  return blockCode
}

const countBacklinks = async (fromPageId: string, toPageCode: number) => {
  const backlinks = await getKysely()
    .selectFrom('PageBacklink')
    .select('toPageId')
    .where('fromPageId', '=', CipherId.fromClient(fromPageId)[0])
    .where('toPageId', '=', CipherId.decrypt(toPageCode))
    .execute()
  return backlinks.length
}

const setUpTeamPageWithLimitedToken = async () => {
  const {cookie, teamId} = await signUp()
  const owner = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const page = await callToolForData(owner, 'create_page', {teamId})
  const pageId = page.createPage.page.id as string
  await callToolForData(owner, 'set_page_content', {pageId, content: '# Plans\n\nNotes'})
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedOrgIds: [],
    grantedTeamIds: [teamId],
    grantedPageIds: []
  })
  return {owner, token, pageId}
}

const SYNCED_PLACEMENT_ROUTES = {
  'editPageContent json': (token: string, pageId: string, blockCode: number) =>
    setPageJson(token, pageId, [syncedPlacement(blockCode)]),
  'set_page_content markdown': (token: string, pageId: string, blockCode: number) =>
    callTool(token, 'set_page_content', {
      pageId,
      content: `# Plans\n\n:::pageLinkBlock {pageCode="${blockCode}" title="Escalation" synced}\n:::`
    }),
  'edit_page markdown': (token: string, pageId: string, blockCode: number) =>
    callTool(token, 'edit_page', {
      pageId,
      edits: [
        {
          oldText: 'Notes',
          newText: `Notes\n\n:::pageLinkBlock {pageCode="${blockCode}" title="Escalation" synced}\n:::`
        }
      ]
    })
}

test.each(Object.entries(SYNCED_PLACEMENT_ROUTES))(
  'a limited connection cannot add a synced block the page does not already contain through %s',
  async (_route, addPlacement) => {
    const {owner, token, pageId} = await setUpTeamPageWithLimitedToken()
    const blockCode = await createSyncedBlock(owner)
    expect(
      expectToolErrorCode(await addPlacement(token, pageId, blockCode), 'FORBIDDEN')
    ).toContain("can't add a synced block")
    expect(await countBacklinks(pageId, blockCode)).toBe(0)
    expect(await callToolForData(owner, 'read_page', {pageId})).toMatchObject({
      public: {page: {content: '# Plans\n\nNotes'}}
    })
  }
)

test('a limited connection keeps the synced blocks and sub-pages it read when it writes the page back', async () => {
  const {owner, token, pageId} = await setUpTeamPageWithLimitedToken()
  const blockCode = await createSyncedBlock(owner)
  const child = await callToolForData(owner, 'create_page', {parentPageId: pageId})
  const childPageId = child.createPage.page.id as string
  const placed = await setPageJson(owner, pageId, [
    subPageLink(childPageId),
    syncedPlacement(blockCode)
  ])
  expect(placed.isError).toBeUndefined()
  const read = await callToolForData(token, 'read_page', {pageId})
  const content = `${read.public.page.content}\n\nMore notes`
  await callToolForData(token, 'set_page_content', {pageId, content})
  await sleep(500)
  const nodes = await readPageNodes(owner, pageId)
  expect(nodes).toContainEqual(subPageLink(childPageId))
  expect(nodes).toContainEqual(
    expect.objectContaining({
      type: 'pageLinkBlock',
      attrs: expect.objectContaining({pageCode: blockCode, synced: true})
    })
  )
  expect((await readPlacement(owner, childPageId)).parentPageId).toBe(pageId)
  expect(await countBacklinks(pageId, blockCode)).toBe(1)
})

test('an unrestricted connection adds a synced block to a page', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const blockCode = await createSyncedBlock(token)
  const page = await callToolForData(token, 'create_page', {})
  const pageId = page.createPage.page.id as string
  expect((await setPageJson(token, pageId, [syncedPlacement(blockCode)])).isError).toBeUndefined()
  for (
    let attempt = 0;
    attempt < 50 && (await countBacklinks(pageId, blockCode)) === 0;
    attempt++
  ) {
    await sleep(100)
  }
  expect(await countBacklinks(pageId, blockCode)).toBe(1)
})
