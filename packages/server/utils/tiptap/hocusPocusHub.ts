import type {Document} from '@hocuspocus/server'
import {hocuspocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {updateYDocNodes} from './updateYDocNodes'

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
      const pageKey = CipherId.toClient(fromPageId, 'page')
      const docConnection = await hocuspocus.openDirectConnection(pageKey, {})
      await docConnection.transact(fn)
      await docConnection.disconnect()
    })
  )
}

export const removeBacklinkedPageLinkBlocks = async ({pageId}: {pageId: number}) => {
  const pageCode = CipherId.encrypt(pageId)
  await withBacklinks(pageId, (doc) => {
    updateYDocNodes(
      doc,
      'pageLinkBlock',
      {pageCode},
      (_, idx, parent) => {
        parent.delete(idx)
      },
      // gotcha: ascending must be false for deletes because Yjs array length will change unlike a JS array
      {ascending: false}
    )
  })
}
