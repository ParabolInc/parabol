import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getScopingTasksConn = (
  viewer?: ReadOnlyRecordProxy | null,
  teamIds?: string[],
  statusFilters?: string[],
  filterQuery?: string
) => {
  if (!viewer) return null
  return ConnectionHandler.getConnection(viewer, 'ParabolScopingSearchResults_tasks', {
    userIds: [],
    teamIds: teamIds || [],
    archived: false,
    statusFilters: statusFilters || [],
    filterQuery: filterQuery || ''
  })
}

export default getScopingTasksConn
