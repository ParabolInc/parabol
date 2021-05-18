import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'

const getThreadSourceThreadConn = (
  store: RecordSourceSelectorProxy,
  threadId: string | null | undefined
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (viewer && threadId) {
    return ConnectionHandler.getConnection(viewer, 'DiscussionThread_thread', {id: threadId})
  }
  return null
}

export default getThreadSourceThreadConn
