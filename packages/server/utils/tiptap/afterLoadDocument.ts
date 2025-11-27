import type {Extension} from '@hocuspocus/server'
import * as Y from 'yjs'
import {updateChangedAt} from '../../../client/tiptap/extensions/database/utils'
import {CipherId} from '../CipherId'
import {handleAddedPageLinks} from './handleAddedPageLinks'
import {handleDeletedPageLinks} from './handleDeletedPageLinks'

export const afterLoadDocument: Extension['afterLoadDocument'] = async ({
  document,
  // DO NOT USE CONTEXT FROM HERE it's just the first user that caused the load on this server,
  documentName
}) => {
  const [pageId] = CipherId.fromClient(documentName)
  const root = document.getXmlFragment('default')
  root.observeDeep((events) => {
    // Ignore any transactions where the page link is "moved" (deleted, then inserted)
    events.forEach((e) => {
      handleAddedPageLinks(e, pageId)
      handleDeletedPageLinks(e, pageId)
    })
  })

  const data = document.getMap<Y.Map<any>>('data')
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
            const row = data.get(key)
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
        const row = data.get(rowId)
        if (!row) {
          return
        }
        event.changes.keys.forEach((_change, _key) => {
          document.transact(() => {
            updateChangedAt(row, 'updated', userId)
          })
        })
      }
    })
  })
}
