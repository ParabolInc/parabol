import {TiptapTransformer} from '@hocuspocus/transformer'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import generateUID from '../../../../../../generateUID'
import getKysely from '../../../../../../postgres/getKysely'
import {CipherId} from '../../../../../../utils/CipherId'
import {createNewPage} from '../../../../../../utils/tiptap/createNewPage'
import {loadPageExportTree} from '../loadPageExportTree'

const pg = getKysely()
const userId = `confluenceTree|${generateUID()}`

const pageDoc = (title: string, extra: object[] = []) =>
  ({
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]},
      {type: 'paragraph'},
      ...extra
    ]
  }) as unknown as TipTapSerializedPageContent

const pageLink = (pageId: number, title: string) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode: CipherId.encrypt(pageId), title, canonical: true}
})

const setPageContent = async (pageId: number, content: TipTapSerializedPageContent) => {
  const yDoc = Buffer.from(
    encodeStateAsUpdate(TiptapTransformer.toYdoc(content, undefined, serverTipTapExtensions))
  )
  await pg.updateTable('Page').set({yDoc}).where('id', '=', pageId).execute()
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Tree Tester'
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
})

describe('loadPageExportTree', () => {
  it('walks canonical links in order, skipping unlinked/trashed pages, root first', async () => {
    const root = await createNewPage({userId, content: pageDoc('Root')})
    const childA = await createNewPage({userId, parentPageId: root.id, content: pageDoc('Child A')})
    const grandchild = await createNewPage({
      userId,
      parentPageId: childA.id,
      content: pageDoc('Grandchild')
    })
    const unlinked = await createNewPage({
      userId,
      parentPageId: root.id,
      content: pageDoc('Unlinked')
    })
    const trashed = await createNewPage({
      userId,
      parentPageId: root.id,
      content: pageDoc('Trashed')
    })
    await pg
      .updateTable('Page')
      .set({isParentLinked: false})
      .where('id', '=', unlinked.id)
      .execute()
    await pg
      .updateTable('Page')
      .set({deletedAt: new Date(), deletedBy: userId})
      .where('id', '=', trashed.id)
      .execute()
    await setPageContent(
      root.id,
      pageDoc('Root', [
        pageLink(childA.id, 'Child A'),
        pageLink(unlinked.id, 'Unlinked'),
        pageLink(trashed.id, 'Trashed')
      ])
    )
    await setPageContent(childA.id, pageDoc('Child A', [pageLink(grandchild.id, 'Grandchild')]))

    const tree = await loadPageExportTree(root.id, true, userId)
    expect(tree).toEqual([
      expect.objectContaining({pageId: root.id, depth: 0, parentPageId: null, status: 'pending'}),
      expect.objectContaining({pageId: childA.id, depth: 1, parentPageId: root.id}),
      expect.objectContaining({pageId: grandchild.id, depth: 2, parentPageId: childA.id})
    ])

    const rootOnly = await loadPageExportTree(root.id, false, userId)
    expect(rootOnly).toHaveLength(1)
    expect(rootOnly[0]!.pageId).toBe(root.id)
  }, 60_000)

  it('returns an empty tree for a viewer without access', async () => {
    const root = await createNewPage({userId, content: pageDoc('Secret')})
    const tree = await loadPageExportTree(root.id, true, 'someRando')
    expect(tree).toHaveLength(0)
  }, 30_000)

  it('stops collecting at MAX + 1 so the mutation can reject oversized trees', async () => {
    const root = await createNewPage({userId, content: pageDoc('Big Root')})
    const children = await pg
      .insertInto('Page')
      .values(
        Array.from({length: 101}, (_, i) => ({
          userId,
          isPrivate: true,
          sortOrder: '',
          title: `Bulk ${i}`,
          parentPageId: root.id,
          ancestorIds: [root.id]
        }))
      )
      .returning('id')
      .execute()
    await pg
      .insertInto('PageAccess')
      .values(children.map(({id}) => ({pageId: id, userId, role: 'owner' as const})))
      .execute()
    await setPageContent(
      root.id,
      pageDoc(
        'Big Root',
        children.map(({id}, i) => pageLink(id, `Bulk ${i}`))
      )
    )
    const tree = await loadPageExportTree(root.id, true, userId)
    expect(tree.length).toBe(101)
  }, 120_000)
})
