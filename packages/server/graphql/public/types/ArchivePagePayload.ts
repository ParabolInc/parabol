import {CipherId} from '../../../utils/CipherId'
import type {ArchivePageActionEnum, ArchivePagePayloadResolvers} from '../resolverTypes'

export type ArchivePagePayloadSource = {
  pageId: number
  action: ArchivePageActionEnum
}

const ArchivePagePayload: ArchivePagePayloadResolvers = {
  pageId: ({pageId}) => CipherId.toClient(pageId, 'page'),
  page: async ({action, pageId}, _args, {dataLoader}) => {
    if (action === 'delete') return null
    return dataLoader.get('pages').loadNonNull(pageId)
  }
}

export default ArchivePagePayload
