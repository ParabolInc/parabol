import type {UpdatePagePayloadResolvers} from '../resolverTypes'

export type UpdatePagePayloadSource = {pageId: number}

const UpdatePagePayload: UpdatePagePayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => {
    return dataLoader.get('pages').loadNonNull(pageId)
  },
  pageSection: async ({pageId}, _args, {authToken, dataLoader}) => {
    return dataLoader.get('pageUserSection').load({pageId, userId: authToken.sub})
  }
}

export default UpdatePagePayload
