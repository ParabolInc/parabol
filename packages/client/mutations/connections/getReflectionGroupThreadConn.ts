import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getReflectionGroupThreadConn = (reflectionGroup: ReadOnlyRecordProxy | null | undefined) => {
  if (reflectionGroup) {
    return ConnectionHandler.getConnection(reflectionGroup, 'DiscussionThread_thread')
  }
  return null
}

export default getReflectionGroupThreadConn
