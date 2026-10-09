import {CipherId} from '../../../utils/CipherId'
import type {PageCommentResolvers} from '../resolverTypes'
import {loadUserPreview} from './helpers/loadUserPreview'

const PageComment: PageCommentResolvers = {
  id: ({id}) => CipherId.toClient(id, 'pageComment'),
  threadId: ({threadId}) => CipherId.toClient(threadId, 'pageThread'),
  content: ({content}) => JSON.stringify(content),
  createdByUser: ({createdBy}, _args, {dataLoader}) => loadUserPreview(createdBy, dataLoader)
}

export default PageComment
