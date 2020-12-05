import {
  ConnectionHandler,
  ReadOnlyRecordProxy,
  RecordSourceSelectorProxy
} from 'relay-runtime'
import toSearchQueryId from '~/utils/relay/toSearchQueryId'
import {SearchQueryMeetingPropName} from '~/utils/relay/LocalPokerHandler'

const getScopingTasksConn = (
  store: RecordSourceSelectorProxy<any>,
  meetingId?: string | null,
  viewer?: ReadOnlyRecordProxy | null,
  teamIds?: string[],
) => {
  if (!meetingId || !viewer) return null
  const parabolSearchQueryId = toSearchQueryId(SearchQueryMeetingPropName.parabol, meetingId)
  const parabolSearchQuery = store.get(parabolSearchQueryId)
  if (!parabolSearchQuery) return null
  const queryString = parabolSearchQuery.getValue('queryString') as string
  const statusFilters = parabolSearchQuery.getValue('statusFilters') as string[]
  return ConnectionHandler.getConnection(viewer, 'ParabolScopingSearchResults_tasks', {
    userIds: [],
    teamIds: teamIds || [],
    archived: false,
    statusFilters: statusFilters || [],
    filterQuery: queryString || ''
  })
}

export default getScopingTasksConn
