import {type Doc, XmlElement, XmlText, type YXmlEvent} from 'yjs'
import {createPageLinkElement} from '../../client/shared/tiptap/createPageLinkElement'
import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
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

const DUPLICATE_PAGE = `
  mutation DuplicatePage($pageId: ID!, $parentPageId: ID) {
    duplicatePage(pageId: $pageId, parentPageId: $parentPageId) {
      page {
        id
        title
        parentPageId
      }
    }
  }
`

const ARCHIVE_PAGE = `
  mutation ArchivePage($pageId: ID!, $action: ArchivePageActionEnum!) {
    archivePage(pageId: $pageId, action: $action) {
      __typename
    }
  }
`

const SHARE_PUBLIC_LINK = `
  mutation SharePublicLink($pageId: ID!) {
    updatePageAccess(pageId: $pageId, subjectType: external, subjectId: "*", role: viewer) {
      __typename
    }
  }
`

const createPage = async (cookie: string) => {
  const res = await sendPublic({query: CREATE_PAGE, cookie})
  return res.data.createPage.page.id as string
}

const addChildPage = async (cookie: string, parentPageId: string) => {
  const childPageCode = await sendTipTap({cookie, pageId: parentPageId}, async (document: Doc) => {
    return new Promise<number>((resolve) => {
      const frag = document.getXmlFragment('default')
      const pageLinkBlock = createPageLinkElement(-1, 'Child', false)
      pageLinkBlock.observe((e: YXmlEvent) => {
        for (const [key] of e.keys) {
          if (key === 'pageCode') resolve(pageLinkBlock.getAttribute('pageCode')!)
        }
      })
      frag.insert(1, [pageLinkBlock] as never)
    })
  })
  return `page:${childPageCode}`
}

const duplicate = (cookie: string, pageId: string, parentPageId?: string) =>
  sendPublic({query: DUPLICATE_PAGE, variables: {pageId, parentPageId}, cookie})

test('duplicates a child page next to the original', async () => {
  const {cookie} = await signUp()
  const parentId = await createPage(cookie)
  const childId = await addChildPage(cookie, parentId)
  const res = await duplicate(cookie, childId)
  expect(res.errors).toBeUndefined()
  expect(res.data.duplicatePage.page).toMatchObject({
    title: expect.stringMatching(/^Copy of /),
    parentPageId: parentId
  })
})

test('includes unsaved edits', async () => {
  const {cookie} = await signUp()
  const parentId = await createPage(cookie)
  const childId = await addChildPage(cookie, parentId)
  await sendTipTap({cookie, pageId: childId}, async (document: Doc) => {
    const frag = document.getXmlFragment('default')
    const paragraph = new XmlElement('paragraph')
    const text = new XmlText()
    text.insert(0, 'unsavedmarker')
    paragraph.insert(0, [text])
    frag.insert(frag.length, [paragraph])
  })
  const res = await duplicate(cookie, childId)
  expect(res.errors).toBeUndefined()
  const [copyId] = CipherId.fromClient(res.data.duplicatePage.page.id)
  const copy = await getKysely()
    .selectFrom('Page')
    .select('plaintextContent')
    .where('id', '=', copyId)
    .executeTakeFirstOrThrow()
  expect(copy.plaintextContent).toContain('unsavedmarker')
})

test('copies into a chosen page', async () => {
  const {cookie} = await signUp()
  const parentId = await createPage(cookie)
  const childId = await addChildPage(cookie, parentId)
  const targetId = await createPage(cookie)
  const res = await duplicate(cookie, childId, targetId)
  expect(res.errors).toBeUndefined()
  expect(res.data.duplicatePage.page.parentPageId).toBe(targetId)
})

test('refuses copying into its own sub-page', async () => {
  const {cookie} = await signUp()
  const parentId = await createPage(cookie)
  const childId = await addChildPage(cookie, parentId)
  const res = await duplicate(cookie, parentId, childId)
  expect(res.errors[0].message).toBe("You can't copy a page there")
})

test('refuses a trashed source', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie)
  const archived = await sendPublic({
    query: ARCHIVE_PAGE,
    variables: {pageId, action: 'archive'},
    cookie
  })
  expect(archived.errors).toBeUndefined()
  const res = await duplicate(cookie, pageId)
  expect(res.errors[0].message).toBe('Restore this page from the Trash before copying it')
})

test('a viewer without access is forbidden', async () => {
  const [owner, stranger] = await Promise.all([signUp(), signUp()])
  const pageId = await createPage(owner.cookie)
  const res = await duplicate(stranger.cookie, pageId)
  expect(res.errors[0].extensions.code).toBe('FORBIDDEN')
})

test('the public link alone does not allow copying', async () => {
  const [owner, stranger] = await Promise.all([signUp(), signUp()])
  const pageId = await createPage(owner.cookie)
  const shared = await sendPublic({
    query: SHARE_PUBLIC_LINK,
    variables: {pageId},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const res = await duplicate(stranger.cookie, pageId)
  expect(res.errors[0].extensions.code).toBe('FORBIDDEN')
})
