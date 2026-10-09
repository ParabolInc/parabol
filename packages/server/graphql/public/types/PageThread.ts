import {CipherId} from '../../../utils/CipherId'
import type {PageThreadResolvers} from '../resolverTypes'
import {loadUserPreview} from './helpers/loadUserPreview'

const PageThread: PageThreadResolvers = {
  id: ({id}) => CipherId.toClient(id, 'pageThread'),
  pageId: ({pageId}) => CipherId.toClient(pageId, 'page'),
  resolvedByUser: ({resolvedBy}, _args, {dataLoader}) => loadUserPreview(resolvedBy, dataLoader),
  comments: ({id}, _args, {dataLoader}) => dataLoader.get('pageCommentsByThreadId').load(id)
}

export default PageThread
