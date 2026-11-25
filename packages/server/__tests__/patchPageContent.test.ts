import {type Doc, XmlElement, type XmlText} from 'yjs'
import getKysely from '../postgres/getKysely'
import {sendPublic, sendTipTap, signUp} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const CREATE_PAGE = `
  mutation CreatePage {
    createPage {
      page {
        id
      }
    }
  }
`

const EDIT_PAGE_CONTENT = `
  mutation EditPageContent($pageId: ID!, $content: String!) {
    editPageContent(pageId: $pageId, content: $content, format: markdown) {
      page {
        id
      }
    }
  }
`

const PATCH_PAGE_CONTENT = `
  mutation PatchPageContent($pageId: ID!, $edits: [PageContentEditInput!]!) {
    patchPageContent(pageId: $pageId, edits: $edits) {
      page {
        id
        content
      }
    }
  }
`

const PAGE_CONTENT = `
  query PageContent($pageId: ID!, $format: PageContentFormatEnum!) {
    public {
      page(pageId: $pageId) {
        content(format: $format)
      }
    }
  }
`

const CREATE_TOKEN = `
  mutation CreateToken($scopes: [OAuthScopeEnum!]!, $grantedPageIds: [ID!], $expiresAt: DateTime!) {
    createPersonalAccessToken(
      name: "agent"
      scopes: $scopes
      grantedPageIds: $grantedPageIds
      expiresAt: $expiresAt
    ) {
      token
    }
  }
`

type Auth = {cookie: string} | {bearerToken: string}

const createPage = async (cookie: string, content: string) => {
  const created = await sendPublic({query: CREATE_PAGE, cookie})
  const pageId: string = created.data.createPage.page.id
  const edited = await sendPublic({query: EDIT_PAGE_CONTENT, variables: {pageId, content}, cookie})
  expect(edited.errors).toBeUndefined()
  return pageId
}

const createToken = async (cookie: string, scopes: string[], grantedPageIds?: string[]) => {
  const res = await sendPublic({
    query: CREATE_TOKEN,
    variables: {
      scopes,
      grantedPageIds,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const patch = (auth: Auth, pageId: string, edits: Record<string, unknown>[]) =>
  sendPublic({query: PATCH_PAGE_CONTENT, variables: {pageId, edits}, ...auth})

const readContent = async (auth: Auth, pageId: string, format = 'markdown') => {
  const res = await sendPublic({query: PAGE_CONTENT, variables: {pageId, format}, ...auth})
  return res.data?.public?.page?.content as string | null | undefined
}

test('an agent reads Markdown and patches one block', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie, '# Plan\n\nFirst step\n\nSecond step')
  expect(await readContent({cookie}, pageId)).toBe('# Plan\n\nFirst step\n\nSecond step')

  const res = await patch({cookie}, pageId, [
    {oldText: 'Second step', newText: 'Second step\n\n- [ ] Third step'}
  ])
  expect(res.errors).toBeUndefined()
  expect(res.data.patchPageContent.page.content).toBe(
    '# Plan\n\nFirst step\n\nSecond step\n\n- [ ] Third step'
  )
  const json = JSON.parse((await readContent({cookie}, pageId, 'json'))!)
  expect(json.content.at(-1).type).toBe('taskList')
})

test('a failed edit returns its code and changes nothing', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie, '# Plan\n\nFirst step')
  const res = await patch({cookie}, pageId, [
    {oldText: 'First', newText: 'Opening'},
    {oldText: 'Missing', newText: 'Anything'}
  ])
  expect(res.errors?.[0]?.extensions?.code).toBe('CONFLICT')
  expect(await readContent({cookie}, pageId)).toBe('# Plan\n\nFirst step')
})

const waitFor = async (isDone: () => boolean | Promise<boolean>) => {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await isDone()) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Timed out waiting for the page to sync')
}

test('a patch merges with a live editor instead of overwriting it', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie, '# Plan\n\nFirst step\n\nSecond step')
  await sendTipTap({cookie, pageId}, async (doc: Doc) => {
    const second = doc.getXmlFragment('default').get(2) as XmlElement
    ;(second.get(0) as XmlText).insert(0, 'Live ')
    await waitFor(async () => (await readContent({cookie}, pageId))?.includes('Live') ?? false)
    const res = await patch({cookie}, pageId, [{oldText: 'First', newText: 'Opening'}])
    expect(res.errors).toBeUndefined()
    expect(res.data.patchPageContent.page.content).toBe(
      '# Plan\n\nOpening step\n\nLive Second step'
    )
    await waitFor(() => doc.getXmlFragment('default').toString().includes('Opening step'))
  })
})

test('setting content refuses an image Parabol does not host, but keeps one the page already has', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie, '# Plan\n\nFirst step')
  const src = 'https://outside.test/a.png'
  const setContent = (content: string) =>
    sendPublic({query: EDIT_PAGE_CONTENT, variables: {pageId, content}, cookie})

  const refused = await setContent(`# Plan\n\n![x](${src})`)
  expect(refused.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  expect(refused.errors?.[0]?.message).toContain('uploadUserAsset')
  expect(await readContent({cookie}, pageId)).toBe('# Plan\n\nFirst step')

  await sendTipTap({cookie, pageId}, async (doc: Doc) => {
    const image = new XmlElement('imageBlock')
    image.setAttribute('src', src)
    image.setAttribute('alt', 'x')
    doc.getXmlFragment('default').push([image])
    await waitFor(async () => (await readContent({cookie}, pageId))?.includes(src) ?? false)
  })
  const read = await readContent({cookie}, pageId)
  expect(read).toBe(`# Plan\n\nFirst step\n\n![x](${src})`)
  const rewritten = read!.replace('First step', 'Opening step')
  expect((await setContent(rewritten)).errors).toBeUndefined()
  expect(await readContent({cookie}, pageId)).toBe(rewritten)
})

test('the payload has the title an edit gave the page', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie, '# Plan\n\nFirst step')
  const res = await sendPublic({
    query: `
      mutation PatchTitle($pageId: ID!, $edits: [PageContentEditInput!]!) {
        patchPageContent(pageId: $pageId, edits: $edits) {
          page {
            title
          }
        }
      }
    `,
    variables: {pageId, edits: [{oldText: '# Plan', newText: '# Roadmap'}]},
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.patchPageContent.page.title).toBe('Roadmap')
})

test('a token needs pages:write to patch and a grant for the page', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie, '# Plan\n\nFirst step')
  const otherPageId = await createPage(cookie, '# Other')
  const edits = [{oldText: 'First', newText: 'Opening'}]

  const readToken = await createToken(cookie, ['PAGES_READ'])
  expect(await readContent({bearerToken: readToken}, pageId)).toBe('# Plan\n\nFirst step')
  const readOnly = await patch({bearerToken: readToken}, pageId, edits)
  expect(readOnly.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const otherPageToken = await createToken(cookie, ['PAGES_READ', 'PAGES_WRITE'], [otherPageId])
  const ungranted = await patch({bearerToken: otherPageToken}, pageId, edits)
  expect(ungranted.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const writeToken = await createToken(cookie, ['PAGES_READ', 'PAGES_WRITE'], [pageId])
  const granted = await patch({bearerToken: writeToken}, pageId, edits)
  expect(granted.errors).toBeUndefined()
  expect(granted.data.patchPageContent.page.content).toBe('# Plan\n\nOpening step')
})

test('someone without access can neither read nor patch the page', async () => {
  const [owner, stranger] = await Promise.all([signUp(), signUp()])
  const pageId = await createPage(owner.cookie, '# Plan\n\nFirst step')
  expect(await readContent({cookie: stranger.cookie}, pageId)).toBeFalsy()
  const res = await patch({cookie: stranger.cookie}, pageId, [{oldText: 'First', newText: 'X'}])
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(await readContent({cookie: owner.cookie}, pageId)).toBe('# Plan\n\nFirst step')
})
