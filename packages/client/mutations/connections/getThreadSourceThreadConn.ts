import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getThreadSourceThreadConn = (threadSource: ReadOnlyRecordProxy | null | undefined) => {
  if (threadSource) {
    return ConnectionHandler.getConnection(threadSource, 'DiscussionThread_thread')
  }
  return null
}

export default getThreadSourceThreadConn
