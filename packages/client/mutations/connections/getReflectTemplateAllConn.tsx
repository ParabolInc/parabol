import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getReflectTemplateAllConn = (viewer: ReadOnlyRecordProxy | null | undefined) => {
  if (viewer) {
    return ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  }
  return null
}

export default getReflectTemplateAllConn
