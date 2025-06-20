import type {Document} from '@hocuspocus/server'
import {EventEmitter} from 'tseep'
import * as Y from 'yjs'
import {server} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {updateYDocNodes} from './updateYDocNodes'

export const hocusPocusHub = new EventEmitter<{
  insertChildPageLink: (parentPageId: number, childPageId: number) => void
  moveChildPageLink: (params: {
    oldParentPageId: number | null
    newParentPageId: number | null
    title: string | null
    childPageId: number
    sortOrder: string
  }) => void
}>()

const createPageLinkElement = (pageId: number, title: string) => {
  const el = new Y.XmlElement()
  el.nodeName = 'pageLinkBlock'
  el.setAttribute('pageId', pageId as any)
  el.setAttribute('title', title)
  el.setAttribute('auto', true as any)
  return el
}

hocusPocusHub.on('insertChildPageLink', async (parentPageId, childPageId) => {
  const parentDocName = CipherId.toClient(parentPageId, 'page')
  const clientChildPageId = CipherId.encrypt(childPageId)
  const docConnection = await server.openDirectConnection(parentDocName, {})
  await docConnection.transact((doc) => {
    const frag = doc.getXmlFragment('default')
    const pageLinkBlock = createPageLinkElement(clientChildPageId, '<Untitled>')
    frag.push([pageLinkBlock])
  })
  // await docConnection.disconnect()
})

hocusPocusHub.on(
  'moveChildPageLink',
  async ({oldParentPageId, newParentPageId, childPageId, sortOrder, title}) => {
    const clientChildPageId = CipherId.encrypt(childPageId)
    const withDoc = async (parentPageId: number, fn: (doc: Document) => void | Promise<void>) => {
      const name = CipherId.toClient(parentPageId, 'page')
      const conn = await server.openDirectConnection(name, {})
      await conn.transact(fn)
      await conn.disconnect()
    }

    const deleteNode = (doc: Document) => {
      updateYDocNodes(
        doc,
        'pageLinkBlock',
        {auto: true, pageId: clientChildPageId},
        (_, idx, parent) => {
          parent.delete(idx)
          console.log('deleting at', idx)
          return 'DONE'
        },
        {maxDepth: 0, ascending: false}
      )
    }
    const insertNode = async (doc: Document) => {
      const pageLinkBlock = createPageLinkElement(clientChildPageId, title || '<Untitled>')
      const putBeforePage = await getKysely()
        .selectFrom('Page')
        .select('id')
        .where('parentPageId', '=', newParentPageId)
        .where('deletedBy', 'is', null)
        .where('sortOrder', '>', sortOrder)
        .orderBy('sortOrder')
        .limit(1)
        .executeTakeFirst()
      const putBeforePageId = putBeforePage ? CipherId.encrypt(putBeforePage.id) : null
      const filters = {auto: true, ...(putBeforePageId && {pageId: putBeforePageId})}
      console.log('looking for', putBeforePageId)
      updateYDocNodes(
        doc,
        'pageLinkBlock',
        filters,
        (_, idx, parent) => {
          const insertAt = putBeforePage ? idx : idx + 1
          parent.insert(insertAt, [pageLinkBlock])
          console.log('inserting at', insertAt)
          return 'DONE'
        },
        {maxDepth: 0, ascending: false}
      )
    }

    if (oldParentPageId && oldParentPageId === newParentPageId) {
      await withDoc(oldParentPageId, async (doc) => {
        // yjs does not have move until v14, so we must delete, then insert
        deleteNode(doc)
        await insertNode(doc)
      })
    } else if (oldParentPageId) {
      await withDoc(oldParentPageId, deleteNode)
    } else if (newParentPageId) {
      await withDoc(newParentPageId, insertNode)
    }
  }
)
