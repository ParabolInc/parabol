import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {PageResolvers} from '../resolverTypes'

const Page: PageResolvers = {
  id: ({id}) => CipherId.toClient(id, 'page'),
  access: ({id}) => ({id}),
  parentPage: async ({parentPageId}, _args, {dataLoader}) => {
    if (!parentPageId) return null
    const parentPage = await dataLoader.get('pages').load(parentPageId)
    return parentPage || null
  },
  parentPageId: ({parentPageId}) => (parentPageId ? CipherId.toClient(parentPageId, 'page') : null),
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
