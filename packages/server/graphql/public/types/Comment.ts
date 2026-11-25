import {plaintextToTipTap} from '../../../../client/shared/tiptap/plaintextToTipTap'
import {getUserId} from '../../../utils/authorization'
import type {CommentResolvers} from '../resolverTypes'

const TOMBSTONE_TEXT = '[deleted]'
const TOMBSTONE = JSON.stringify(plaintextToTipTap(TOMBSTONE_TEXT))

const Comment: CommentResolvers = {
  content: ({isActive, content}) => {
    if (!isActive) return TOMBSTONE
    return JSON.stringify(content)
  },

  plaintextContent: ({isActive, plaintextContent}) =>
    isActive ? plaintextContent : TOMBSTONE_TEXT,

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
  }
}

export default Comment
