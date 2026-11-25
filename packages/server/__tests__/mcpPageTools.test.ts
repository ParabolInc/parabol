import {getUserTeams, HOST, PROTOCOL, signUp} from './common'
import {callToolForData, createPersonalAccessToken, listTools, PNG_BASE64} from './mcpClient'

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
