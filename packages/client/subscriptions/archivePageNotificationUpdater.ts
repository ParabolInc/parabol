import {handleArchivePage} from '../mutations/useArchivePageMutation'
import type {SharedUpdater} from '../types/relayMutations'

const archivePageNotificationUpdater: SharedUpdater<any> = (payload, context) => {
  const archivedPageId = payload.getValue('pageId')
  const archivedPage = payload.getLinkedRecord('page')
  handleArchivePage(archivedPageId, {
    ...context,
    isHardDelete: !archivedPage
  })
}

export default archivePageNotificationUpdater
