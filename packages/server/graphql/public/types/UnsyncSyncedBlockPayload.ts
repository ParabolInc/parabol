import type {UnsyncSyncedBlockPayloadResolvers} from '../resolverTypes'

export type UnsyncSyncedBlockPayloadSource = {
  pageId: number
}

const UnsyncSyncedBlockPayload: UnsyncSyncedBlockPayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => dataLoader.get('pages').loadNonNull(pageId)
}

export default UnsyncSyncedBlockPayload
