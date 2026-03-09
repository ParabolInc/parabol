import type {ArchivePageActionEnum, ArchivePagePayloadResolvers} from '../resolverTypes'

export type ArchivePagePayloadSource = {
  pageId: number
  publicId: number
  action: ArchivePageActionEnum
}

const ArchivePagePayload: ArchivePagePayloadResolvers = {
  pageId: ({publicId}) => `page:${publicId}`,
  page: async ({action, pageId}, _args, {dataLoader}) => {
    if (action === 'delete') return null
    return dataLoader.get('pages').loadNonNull(pageId)
  }
}

export default ArchivePagePayload
