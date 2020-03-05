import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getReflectionGroupTasksConn = (reflectionGroup: ReadOnlyRecordProxy | null | undefined) => {
  if (reflectionGroup) {
    return ConnectionHandler.getConnection(reflectionGroup, 'DiscussionThread_thread')
  }
  return null
}

export default getReflectionGroupTasksConn
