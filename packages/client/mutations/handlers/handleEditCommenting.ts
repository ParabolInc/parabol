import {RecordProxy} from 'relay-runtime'
import createProxyRecord from '../../utils/relay/createProxyRecord'
import getDiscussionThreadConn from '../connections/getDiscussionThreadConn'

interface Commentor {
  userId: string
  preferredName: string
}
const handleEditCommenting = (payload, store) => {
  const discussionId = payload.getValue('discussionId')
  const commentor = payload.getLinkedRecord('commentor')
  const commentorId = commentor.getValue('id')
  const preferredName = commentor.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  const thread = getDiscussionThreadConn(store, discussionId)
  if (!thread) return
  const commentors = thread.getLinkedRecords<Commentor[]>('commentors') || []
  if (commentors.length === 1 && !isCommenting) {
    thread.setValue(null, 'commentors')
    return
  }

  const newCommentors = [] as RecordProxy<Commentor>[]
  for (let ii = 0; ii < commentors.length; ii++) {
    const commentor = commentors[ii]
    if (commentor.getValue('id') !== commentorId) {
      newCommentors.push(commentor)
    }
  }
  if (isCommenting) {
    const newCommentor = createProxyRecord(store, 'CommentorDetails', {
      userId: commentorId,
      preferredName
    })
    newCommentors.push(newCommentor)
  }

  if (newCommentors) {
    thread.setLinkedRecords(newCommentors, 'commentors')
  } else {
    thread.setValue(null, 'commentors')
  }
}

export default handleEditCommenting
