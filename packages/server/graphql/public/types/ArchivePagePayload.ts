import {PageId} from '../../../utils/PageId'
import type {ArchivePageActionEnum, ArchivePagePayloadResolvers} from '../resolverTypes'

export type ArchivePagePayloadSource = {
  pageId: number
  action: ArchivePageActionEnum
}

const ArchivePagePayload: ArchivePagePayloadResolvers = {
  pageId: ({pageId}) => PageId.join(pageId),
  page: async ({action, pageId}, _args, {dataLoader}) => {
    if (action === 'delete') return null
    return dataLoader.get('pages').loadNonNull(pageId)
  }
}

export default ArchivePagePayload
