import {ConnectionHandler, type ReadOnlyRecordProxy} from 'relay-runtime'

const getClickUpTasksConn = (
  clickUpIntegration: ReadOnlyRecordProxy | null | undefined,
  queryString: string,
  listIds: string[]
) => {
  if (!clickUpIntegration) return null
  return ConnectionHandler.getConnection(clickUpIntegration, 'ClickUpScopingSearchResults_tasks', {
    queryString,
    listIds
  })
}

export default getClickUpTasksConn
