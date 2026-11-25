import * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import type {TipTapContentNode} from '../../../client/shared/tiptap/TipTapSerializedContent'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import logError from '../logError'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
import {createNewPage} from './createNewPage'
import getTokenContextFromTransaction from './getTokenContextFromTransaction'
import {getUserIdFromTransaction} from './getUserIdFromTransaction'
import {publishSyncedBlockPlacementsChanged} from './hocusPocusHub'
import {isRemovedFromDoc} from './isRemovedFromDoc'
import {movePageToNewParent} from './movePageToNewParent'
import {rehostSeededAssets} from './rehostExternalAssets'
import {restoreSeed} from './restoreSeed'
import {sanitizeSyncedBlockSeed} from './sanitizeSyncedBlockSeed'
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

const isLiveSubPage = async (pageId: number, parentPageId: number) => {
  const subPage = await getKysely()
    .selectFrom('Page')
    .select('id')
    .where('id', '=', pageId)
    .where('parentPageId', '=', parentPageId)
    .where('deletedAt', 'is', null)
    .executeTakeFirst()
  return !!subPage
}

export const handleAddedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const userId = getUserIdFromTransaction(e.transaction)
  const {resourceGrants: grants, scopes} = getTokenContextFromTransaction(e.transaction)
  const hasLimitedGrant = !!grants && Object.values(grants).some((ids) => ids !== null)
  getAddedPageLinks(e).forEach(async (node) => {
    const seed = node.getAttribute('content')
    if (seed !== undefined) node.removeAttribute('content')
    const childPageCode = node.getAttribute('pageCode')!
    let seedContent: TipTapContentNode[] = []
    let isAwaitingPage = false
    try {
      if (childPageCode !== NEW_PAGE_SENTINEL_CODE) {
        // if a new PageLink was added to the doc, update the backlinks
        const childPageId = CipherId.decrypt(childPageCode)
        const isSynced = node.getAttribute('synced') === true
        updateBacklinks(parentPageId, childPageId)
          .then(() => {
            if (isSynced) publishSyncedBlockPlacementsChanged(childPageId)
          })
          .catch(Logger.log)
      }
      if (node.getAttribute('canonical') !== true || !userId) return
      if (childPageCode === NEW_PAGE_SENTINEL_CODE) {
        // mint a fresh page and assign it a real pageCode
        const isDatabase = node.getAttribute('database') || false
        const isSyncedBlock = node.getAttribute('synced') === true
        const title = node.getAttribute('title')
        seedContent = sanitizeSyncedBlockSeed(seed)
        isAwaitingPage = true
        const bodyNodes =
          seedContent.length > 0 || !isSyncedBlock ? seedContent : [{type: 'paragraph' as const}]
        const newPage = await createNewPage({
          parentPageId,
          userId,
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
              ...bodyNodes
            ]
          }
        }).catch(Logger.error)
        isAwaitingPage = false
        if (!newPage) {
          restoreSeed(node, seedContent)
          return
        }
        if (isSyncedBlock && isRemovedFromDoc(node)) {
          await getKysely().deleteFrom('Page').where('id', '=', newPage.id).execute()
          return
        }
        node.setAttribute('pageCode', CipherId.encrypt(newPage.id))
        if (isSyncedBlock) node.setAttribute('title', '')
        rehostSeededAssets(newPage.id, seedContent, userId, grants, scopes)
        await updateBacklinks(parentPageId, newPage.id)
        if (isSyncedBlock) publishSyncedBlockPlacementsChanged(newPage.id)
      } else {
        // check for duplicates on the same page
        const existingNode = getPageLinks(e.target.doc, true).find(
          (child) => child !== node && child.getAttribute('pageCode') === childPageCode
        )
        if (existingNode) {
          // the viewer is programmatically attempting to inject a second canonical page link
          node.setAttribute('canonical', false)
        } else if (
          hasLimitedGrant &&
          !(await isLiveSubPage(CipherId.decrypt(childPageCode), parentPageId))
        ) {
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
      if (isAwaitingPage) restoreSeed(node, seedContent)
      logError(error as Error, {userId, extras: {parentPageId, childPageCode}})
    }
  })
}
