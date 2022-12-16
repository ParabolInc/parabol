import {ConnectionHandler, RecordSourceProxy} from 'relay-runtime'

const getDiscussionThreadConn = (
  store: RecordSourceProxy,
  discussionId: string | null | undefined
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return null
  const discussion =
    viewer.getLinkedRecord('discussion', {id: discussionId}) ??
    (discussionId && store.get(discussionId))
  if (!discussion) return null
  return ConnectionHandler.getConnection(discussion, 'DiscussionThread_thread')
}

export default getDiscussionThreadConn
