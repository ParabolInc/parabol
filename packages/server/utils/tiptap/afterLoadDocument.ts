import type {Extension} from '@hocuspocus/server'
import * as Y from 'yjs'
import {getData, getRowData} from '../../../client/tiptap/extensions/database/data'
import {updateChangedAt} from '../../../client/tiptap/extensions/database/utils'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {getUserIdFromTransaction} from './getUserIdFromTransaction'
import {handleAddedPageLinks} from './handleAddedPageLinks'
import {handleDeletedPageLinks} from './handleDeletedPageLinks'
import {rehostExternalAssets} from './rehostExternalAssets'
import {removeClientThinkingBlocks} from './removeClientThinkingBlocks'
import {syncPageEmbeds} from './syncPageEmbeds'
import {syncPageUserMentionNames} from './syncPageUserMentionNames'

// Track observers per document so they can be cleaned up on unload
const documentObservers = new Map<
  string,
  {root: (...args: any[]) => void; data: (...args: any[]) => void}
>()

export const afterLoadDocument: Extension['afterLoadDocument'] = async ({
  document,
  // DO NOT USE CONTEXT FROM HERE it's just the first user that caused the load on this server,
  documentName
}) => {
  // Guard against double-load without intervening unload
  if (documentObservers.has(documentName)) return
  const [pageId, , entity] = CipherId.fromClient(documentName)
  if (entity !== 'page') return
  syncPageUserMentionNames(document, pageId).catch(Logger.log)
  syncPageEmbeds(document).catch(Logger.log)
  const root = document.getXmlFragment('default')
  const rootObserver = (events: any[]) => {
    // Ignore any transactions where the page link is "moved" (deleted, then inserted)
    events.forEach((e) => {
      removeClientThinkingBlocks(e)
      handleAddedPageLinks(e, pageId)
      handleDeletedPageLinks(e, pageId)
      rehostExternalAssets(e, pageId)
    })
  }
  root.observeDeep(rootObserver)

  const data = getData(document)
  const dataObserver = (events: Y.YEvent<any>[], transaction: Y.Transaction) => {
    const userId = getUserIdFromTransaction(transaction)
    if (!userId) {
      return
    }

    document.transact(() => {
      events.forEach((event) => {
        const isRowLevel = event.path.length === 0
        const isCellLevel = event.path.length === 1

        if (isRowLevel) {
          event.changes.keys.forEach((change: {action: string}, key: string) => {
            if (change.action === 'add') {
              const row = getRowData(document, key)
              if (!row) {
                return
              }
              updateChangedAt(row, 'created', userId)
            }
          })
        }
        if (isCellLevel) {
          const rowId = event.path[0] as string
          const row = getRowData(document, rowId)
          if (!row) {
            return
          }
          if (event.changes.delta.length > 0) {
            updateChangedAt(row, 'updated', userId)
          }
        }
      })
    })
  }
  data.observeDeep(dataObserver)

  documentObservers.set(documentName, {root: rootObserver, data: dataObserver})
}

export const afterUnloadDocument: Extension['afterUnloadDocument'] = async ({documentName}) => {
  // The Y.Doc is already destroyed by the time afterUnloadDocument fires,
  // so the observers are gone with it. We just need to clean up our tracking map.
  documentObservers.delete(documentName)
}
