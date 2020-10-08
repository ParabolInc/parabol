
import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'
import createProxyRecord from './createProxyRecord'

const LocalPokerHandler: Handler = {
  update(store, payload) {
    const meetingId = payload.dataID
    const meeting = store.get(meetingId)!
    const queryId = `jiraSearchQuery:${meetingId}`
    const existingQuery = store.get(queryId)
    if (!existingQuery) {
      const jiraSearchQuery = createProxyRecord(store, 'JiraSearchQuery', {
        id: queryId,
        queryString: '',
        projectKeyFilters: [],
        isJQL: false
      })
      meeting.setLinkedRecord(jiraSearchQuery, 'jiraSearchQuery')
    }
  }
}

export default LocalPokerHandler
