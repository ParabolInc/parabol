import type {Extension} from '@hocuspocus/server'
import {getData, getRowData} from '../../../client/tiptap/extensions/database/data'
import {updateChangedAt} from '../../../client/tiptap/extensions/database/utils'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {handleAddedPageLinks} from './handleAddedPageLinks'
import {handleDeletedPageLinks} from './handleDeletedPageLinks'
import {syncPageUserMentionNames} from './syncPageUserMentionNames'

export const afterLoadDocument: Extension['afterLoadDocument'] = async ({
  document,
  // DO NOT USE CONTEXT FROM HERE it's just the first user that caused the load on this server,
  documentName
}) => {
  syncPageUserMentionNames(document).catch(Logger.log)
  const [pageId] = CipherId.fromClient(documentName)
  const root = document.getXmlFragment('default')
  root.observeDeep((events) => {
    // Ignore any transactions where the page link is "moved" (deleted, then inserted)
    events.forEach((e) => {
      handleAddedPageLinks(e, pageId)
      handleDeletedPageLinks(e, pageId)
    })
  })

  const data = getData(document)
  data.observeDeep((events, transaction) => {
    const userId = transaction.origin?.context?.userId ?? undefined
    if (!userId) {
      return
    }

    events.forEach((event) => {
      const isRowLevel = event.path.length === 0
      const isCellLevel = event.path.length === 1

      if (isRowLevel) {
        event.changes.keys.forEach((change, key) => {
          if (change.action === 'add') {
            const row = getRowData(document, key)
            if (!row) {
              return
            }
            document.transact(() => {
              updateChangedAt(row, 'created', userId)
            })
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
          document.transact(() => {
            updateChangedAt(row, 'updated', userId)
          })
        }
      }
    })
  })
}
