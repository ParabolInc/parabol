import type {Extension} from '@hocuspocus/server'
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
}
