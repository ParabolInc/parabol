import type {Document} from '@hocuspocus/server'
import {CipherId} from '../CipherId'
import {updateYDocNodes} from './updateYDocNodes'
import {withDoc} from './withDoc'

export const removeCanonicalPageLinkFromPage = async (parentPageId: number, pageId: number) => {
  const pageCode = CipherId.encrypt(pageId)
  const deleteNode = (doc: Document) => {
    updateYDocNodes(
      doc,
      'pageLinkBlock',
      {canonical: true, pageCode},
      (_, idx, parent) => {
        parent.delete(idx)
        return 'DONE'
      },
      {maxDepth: 0, ascending: false}
    )
  }
  await withDoc(parentPageId, deleteNode)
}
