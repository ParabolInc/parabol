import {getNewDataLoader} from '../../../../../dataloader/getNewDataLoader'
import type {Page} from '../../../../../postgres/types'
import {Logger} from '../../../../../utils/Logger'
import {publishPageNotification} from '../../../../../utils/publishPageNotification'
import {publishSyncedBlockPlacementsChanged} from '../../../../../utils/tiptap/hocusPocusHub'
import {publishToEmbedder} from '../../../../mutations/helpers/publishToEmbedder'
import type {PageCopy} from './buildPageCopies'

interface Params {
  rootCopy: Page
  copies: PageCopy[]
  viewerId: string
  mutatorId?: string
}

export const announcePageCopies = async ({rootCopy, copies, viewerId, mutatorId}: Params) => {
  const dataLoader = getNewDataLoader('announcePageCopies')
  try {
    await publishPageNotification(
      rootCopy.id,
      'CreatePagePayload',
      {page: rootCopy},
      {mutatorId, operationId: dataLoader.share()},
      dataLoader
    ).catch(Logger.log)
  } finally {
    dataLoader.dispose()
  }
  new Set(copies.flatMap(({syncedBlockIds}) => syncedBlockIds)).forEach(
    publishSyncedBlockPlacementsChanged
  )
  copies.forEach(({id: pageId}) => {
    publishToEmbedder({jobType: 'embedPage:start', pageId, userId: viewerId}).catch(Logger.log)
  })
}
