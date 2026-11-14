import type {Handler} from 'relay-runtime/store/RelayStoreTypes'
import type {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import createProxyRecord from './createProxyRecord'
import initHandler from './initHandler'

const LocalPokerHandler: Handler = {
  update(store, payload) {
    initHandler(store, payload)
    const meetingId = payload.dataID
    const meeting = store.get(meetingId)!

    if (!meeting.getLinkedRecords('scopingSearchQueries')) {
      meeting.setLinkedRecords([], 'scopingSearchQueries')
    }

    const parabolQueryId = SearchQueryId.join('PARABOL', meetingId)
    if (!store.get(parabolQueryId)) {
      const parabolQuery = createProxyRecord(store, 'ParabolSearchQuery', {
        id: parabolQueryId,
        queryString: '',
        statusFilters: ['active'] as TaskStatusEnum[]
      })
      meeting.setLinkedRecord(parabolQuery, 'parabolSearchQuery')
    }
  }
}

export default LocalPokerHandler
