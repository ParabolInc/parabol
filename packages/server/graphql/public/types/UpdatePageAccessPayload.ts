import type {UpdatePageAccessPayloadResolvers} from '../resolverTypes'

export type UpdatePageAccessPayloadSource = {pageId: number}

const UpdatePageAccessPayload: UpdatePageAccessPayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => {
    return dataLoader.get('pages').loadNonNull(pageId)
  },
  pageSection: async ({pageId}, _args, {authToken, dataLoader}) => {
    return dataLoader.get('pageUserSection').load({pageId, userId: authToken.sub})
  }
}

export default UpdatePageAccessPayload
