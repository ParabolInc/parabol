import * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
import {createNewPage} from './createNewPage'
import {movePageToNewParent} from './movePageToNewParent'
import {updateBacklinks} from './updateBacklinks'

export const handleAddedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const {changes, transaction} = e
  const {added} = changes
  const userId = transaction.origin?.context?.userId
  added.forEach(async (item) => {
    const [node] = item.content.getContent()
    if (!isPageLink(node)) return
    const childPageCode = node.getAttribute('pageCode')!
    if (childPageCode !== NEW_PAGE_SENTINEL_CODE) {
      // if a new PageLink was added to the doc, update the backlinks
      const childPageId = CipherId.decrypt(childPageCode)
      updateBacklinks(parentPageId, childPageId).catch(Logger.log)
    }
    if (node.getAttribute('canonical') !== true) return
    if (childPageCode === NEW_PAGE_SENTINEL_CODE) {
      // mint a fresh page and assign it a real pageCode
      const observer = async (e: Y.YXmlEvent) => {
        // TODO: does observeAll also watch for this? is it redundant?
        node.unobserve(observer)
        // this only needs to get called on freshly minted PageLinks because after the pageCode is set
        for (const [key] of e.keys) {
          if (key === 'pageCode') {
            const newValue = (e.target as Y.XmlElement<PageLinkBlockAttrs>).getAttribute('pageCode')
            const addToPageId =
              newValue && newValue !== NEW_PAGE_SENTINEL_CODE ? CipherId.decrypt(newValue) : null
            if (addToPageId) {
              await updateBacklinks(parentPageId, addToPageId)
            }
          }
        }
      }
      node.observe(observer)
      const isDatabase = node.getAttribute('database') || false
      const title = node.getAttribute('title')
      const newPage = await createNewPage({
        parentPageId,
        userId,
        isDatabase,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: {level: 1},
              content: title ? [{type: 'text', text: title}] : []
            }
          ]
        }
      }).catch(Logger.error)
      if (!newPage) return
      const pageCode = CipherId.encrypt(newPage.id)
      node.setAttribute('pageCode', pageCode)
    } else {
      // check for duplicates on the same page
      const existingNode = getPageLinks(e.target.doc, true).find(
        (child) => child !== node && child.getAttribute('pageCode') === childPageCode
      )
      if (existingNode) {
        // the viewer is programmatically attempting to inject a second canonical page link
        node.setAttribute('canonical', false)
      } else {
        // a page link either got moved or the viewer is trying to programmatically add one
        // in either case, move the page link from the old parent to new
        // it could also be a cut+paste, where they cut & deleted the page, and pasted in the same or a new page
        try {
          await movePageToNewParent(userId, CipherId.decrypt(childPageCode), parentPageId)
        } catch (e) {
          Logger.error(e)
          const parent = node.parent
          if (parent instanceof Y.XmlElement) {
            const idxToRemove = parent.toArray().findIndex((child) => child === node)
            parent.delete(idxToRemove)
          }
        }
      }
    }
  })
}
