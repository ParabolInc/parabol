import type {Document} from '@hocuspocus/server'
import {EventEmitter} from 'tseep'
import * as Y from 'yjs'
import {server} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {updateYDocNodes} from './updateYDocNodes'

export const hocusPocusHub = new EventEmitter<{
  moveChildPageLink: (params: {
    oldParentPageId: number | null
    newParentPageId: number | null
    title: string | null
    childPageId: number
    sortOrder: string
  }) => void
  removeBacklinks: (params: {pageId: number}) => void
}>()

const createPageLinkElement = (pageId: number, title: string) => {
  const el = new Y.XmlElement()
  el.nodeName = 'pageLinkBlock'
  el.setAttribute('pageId', pageId as any)
  el.setAttribute('title', title)
  el.setAttribute('auto', true as any)
  return el
}

export const withBacklinks = async (
  pageId: number,
  fn: (doc: Document) => void | Promise<void>
) => {
  const pg = getKysely()
  const backLinks = await pg
    .selectFrom('PageBacklink')
    .select('fromPageId')
    .where('toPageId', '=', pageId)
    .execute()
  await Promise.all(
    backLinks.map(async ({fromPageId}) => {
      const backlinkDocName = CipherId.toClient(fromPageId, 'page')
      const docConnection = await server.openDirectConnection(backlinkDocName, {})
      await docConnection.transact(fn)
      await docConnection.disconnect()
    })
  )
}

hocusPocusHub.on('removeBacklinks', async ({pageId}) => {
  const clientNumber = CipherId.encrypt(pageId)
  await withBacklinks(pageId, (doc) => {
    updateYDocNodes(
      doc,
      'pageLinkBlock',
      {pageId: clientNumber},
      (_, idx, parent) => {
        parent.delete(idx)
      },
      // gotcha: ascending must be false for deletes because Yjs array length will change unlink a JS array
      {ascending: false}
    )
  })
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
