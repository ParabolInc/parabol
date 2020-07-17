import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getReflectTemplatePublicConn = (retroSettings: ReadOnlyRecordProxy | null | undefined) => {
  if (retroSettings) {
    return ConnectionHandler.getConnection(retroSettings, 'reflection_publicTemplates')
  }
  return null
}

export default getReflectTemplatePublicConn
