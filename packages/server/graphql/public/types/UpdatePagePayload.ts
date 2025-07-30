import type {UpdatePagePayloadResolvers} from '../resolverTypes'

export type UpdatePagePayloadSource = {pageId: number}

const UpdatePagePayload: UpdatePagePayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => {
    return dataLoader.get('pages').loadNonNull(pageId)
  }
}

export default UpdatePagePayload
