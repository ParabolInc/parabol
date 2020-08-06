import createProxyRecord from '../../utils/relay/createProxyRecord'

const handleEditTask = (payload, store) => {
  const threadId = payload.getValue('threadId')
  const commenter = payload.getLinkedRecord('commenter')
  const commenterId = commenter.getValue('id')
  const preferredName = commenter.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')

  const thread = store.get(threadId)
  if (!thread) return
  const commenters = thread.getLinkedRecords('commenters') || []
  if (!commenters || (commenters.length === 1 && !isCommenting)) {
    thread.setValue(null, 'commenters')
    return
  }

  const newCommenters = [] as any
  for (let ii = 0; ii < commenters.length; ii++) {
    const commenter = commenters[ii]
    if (commenter.getValue('userId') !== commenterId) {
      newCommenters.push(commenter)
    }
  }
  if (isCommenting) {
    const newCommenter = createProxyRecord(store, 'CommenterDetails', {
      userId: commenterId,
      preferredName
    })
    newCommenters.push(newCommenter)
  }

  if (newCommenters) {
    thread.setLinkedRecords(newCommenters, 'commenters')
  } else {
    thread.setValue(null, 'commenters')
  }
}

export default handleEditTask
