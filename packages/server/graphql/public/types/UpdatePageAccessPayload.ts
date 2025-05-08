import {UpdatePageAccessPayloadResolvers} from '../resolverTypes'

export type UpdatePageAccessPayloadSource = {pageId: number}

const UpdatePageAccessPayload: UpdatePageAccessPayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => {
    return dataLoader.get('pages').loadNonNull(pageId)
  }
}

export default UpdatePageAccessPayload
