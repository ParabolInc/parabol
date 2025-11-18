import {GraphQLError} from 'graphql'
import {CipherId} from '../../../utils/CipherId'
import type {PublicRootResolvers} from '../resolverTypes'

const PublicRoot: PublicRootResolvers = {
  page: async (_source, {pageId}, {authToken, dataLoader}) => {
    const [dbId] = CipherId.fromClient(pageId)
    const [page, access] = await Promise.all([
      dataLoader.get('pages').load(dbId),
      dataLoader.get('pageAccessByUserId').load({pageId: dbId, userId: authToken?.sub ?? ''})
    ])
    if (!page) throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
    if (!access)
      throw new GraphQLError('Viewer does not have access to page', {
        extensions: {code: 'UNAUTHORIZED'}
      })
    return page
  }
}

export default PublicRoot
