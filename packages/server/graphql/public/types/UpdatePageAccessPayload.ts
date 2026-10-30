import type {UpdatePageAccessPayloadResolvers} from '../resolverTypes'

export type UpdatePageAccessPayloadSource = {pageId: number}

const UpdatePageAccessPayload: UpdatePageAccessPayloadResolvers = {
  page: ({pageId}, _args, {dataLoader}) => {
    return dataLoader.get('pages').loadNonNull(pageId)
  },
  pageSection: async ({pageId}, _args, {authToken, dataLoader}) => {
    const userId = authToken.sub
    const role = await dataLoader.get('pageAccessByPageIdUserId').load({pageId, userId})
    if (!role) return null
    return dataLoader.get('pageUserSection').load({pageId, userId})
  }
}

export default UpdatePageAccessPayload
