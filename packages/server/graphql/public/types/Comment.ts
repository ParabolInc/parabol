import {convertTipTapTaskContent} from '../../../../client/shared/tiptap/convertTipTapTaskContent'
import {getUserId} from '../../../utils/authorization'
import resolveReactjis from '../../resolvers/resolveReactjis'
import {CommentResolvers} from '../resolverTypes'

const TOMBSTONE = convertTipTapTaskContent('[deleted]')

const Comment: CommentResolvers = {
  content: ({isActive, content}) => {
    if (!isActive) return TOMBSTONE
    return JSON.stringify(content)
  },

  createdBy: ({createdBy, isAnonymous}) => {
    return isAnonymous ? null : createdBy
  },

  createdByUser: ({createdBy, isActive, isAnonymous}, _args, {dataLoader}) => {
    return isAnonymous || !isActive || !createdBy
      ? null
      : dataLoader.get('users').loadNonNull(createdBy)
  },

  isActive: ({isActive}) => !!isActive,
  isAnonymous: ({isAnonymous}) => !!isAnonymous,

  isViewerComment: ({createdBy, isActive}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return isActive ? viewerId === createdBy : false
  },

  reactjis: (source, args, context) => {
    const {isActive} = source
    return isActive ? resolveReactjis(source, args, context) : []
  }
}

export default Comment
