import * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import logError from '../logError'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
import {createNewPage} from './createNewPage'
import {getUserIdFromTransaction} from './getUserIdFromTransaction'
import {isSyncedBlocksEnabled} from './isSyncedBlocksEnabled'
import {movePageToNewParent} from './movePageToNewParent'
import {updateBacklinks} from './updateBacklinks'

const getAddedPageLinks = (e: Y.YEvent<any>) => {
  const links: Y.XmlElement<PageLinkBlockAttrs>[] = []
  e.changes.added.forEach((item) => {
    item.content.getContent().forEach((content) => {
      if (!(content instanceof Y.XmlElement)) return
      if (isPageLink(content)) links.push(content)
      for (const node of content.createTreeWalker(isPageLink)) {
        if (isPageLink(node)) links.push(node)
      }
    })
  })
  return links
}

export const handleAddedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const userId = getUserIdFromTransaction(e.transaction)
  getAddedPageLinks(e).forEach(async (node) => {
    const childPageCode = node.getAttribute('pageCode')!
    try {
      if (childPageCode !== NEW_PAGE_SENTINEL_CODE) {
        // if a new PageLink was added to the doc, update the backlinks
        const childPageId = CipherId.decrypt(childPageCode)
        updateBacklinks(parentPageId, childPageId).catch(Logger.log)
      }
      if (node.getAttribute('canonical') !== true) return
      if (childPageCode === NEW_PAGE_SENTINEL_CODE) {
        // mint a fresh page and assign it a real pageCode
        const isDatabase = node.getAttribute('database') || false
        const title = node.getAttribute('title')
        let isSyncedBlock = false
        if (node.getAttribute('synced') === true) {
          const dataLoader = getNewDataLoader('handleAddedPageLinks')
          isSyncedBlock = await isSyncedBlocksEnabled(userId, dataLoader).finally(() =>
            dataLoader.dispose()
          )
          if (!isSyncedBlock) node.removeAttribute('synced')
        }
        const newPage = await createNewPage({
          parentPageId,
          userId: userId!,
          isDatabase,
          isSyncedBlock,
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: {level: 1},
                content: title ? [{type: 'text', text: title}] : []
              },
              ...(isSyncedBlock ? [{type: 'paragraph' as const}] : [])
            ]
          }
        }).catch(Logger.error)
        if (!newPage) return
        node.setAttribute('pageCode', CipherId.encrypt(newPage.id))
        await updateBacklinks(parentPageId, newPage.id)
      } else {
        if (!userId) return
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
            node.setAttribute('canonical', false)
          }
        }
      }
    } catch (error) {
      logError(error as Error, {userId, extras: {parentPageId, childPageCode}})
    }
  })
}
