import {GraphQLError} from 'graphql'
import {CipherId} from '../../../utils/CipherId'
import type {QueryResolvers} from '../resolverTypes'

const page: QueryResolvers['page'] = async (_source, {pageId}, {authToken, dataLoader}) => {
  const [dbId] = CipherId.fromClient(pageId)
  const [page, access] = await Promise.all([
    dataLoader.get('pages').load(dbId),
    dataLoader.get('pageAccessByUserId').load({pageId: dbId, userId: authToken?.sub ?? ''})
  ])
  if (!page) throw new GraphQLError('Page not found')
  if (!access)
    throw new GraphQLError('Viewer does not have access to page', {
      extensions: {code: 'UNAUTHORIZED'}
    })
  return page
}

export default page
