import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {PageResolvers} from '../resolverTypes'

const Page: PageResolvers = {
  id: ({id}) => `page:${feistelCipher.encrypt(id)}`,
  access: ({id}) => ({id}),
  parentPage: async ({parentPageId}, _args, {dataLoader}) => {
    if (!parentPageId) return null
    const parentPage = await dataLoader.get('pages').load(parentPageId)
    return parentPage || null
  },
  parentPageId: ({parentPageId}) =>
    parentPageId ? `page:${feistelCipher.encrypt(parentPageId)}` : null,
  sortOrder: async (
    {id: pageId, isPrivate, teamId, parentPageId, sortOrder},
    _args,
    {authToken, dataLoader}
  ) => {
    const isTopLevelShared = !teamId && !parentPageId && !isPrivate
    if (!isTopLevelShared) return sortOrder
    const viewerId = getUserId(authToken)
    const userSortOrder = await dataLoader.get('pageUserSortOrder').load({pageId, userId: viewerId})
    // should never be null, but just in case
    return userSortOrder || '!'
  }
}

export default Page
