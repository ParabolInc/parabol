import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'
import {TaskStatusEnum, TaskServiceEnum} from '~/types/graphql'
import createProxyRecord from './createProxyRecord'

const lookup = {
  [TaskServiceEnum.jira]: {
    meetingPropertyName: 'jiraSearchQuery',
    defaultQuery: {
      queryString: '',
      projectKeyFilters: [],
      isJQL: false
    }
  },
  [TaskServiceEnum.PARABOL]: {
    meetingPropertyName: 'parabolSearchQuery',
    defaultQuery: {
      queryString: '',
      statusFilters: [TaskStatusEnum.active]
    }
  }
}

const initializeDefaultSearchQueries = (store, payload): void => {
  const meetingId = payload.dataID
  const meeting = store.get(meetingId)!

  for (const [_, data] of Object.entries(lookup)) {
    const {meetingPropertyName, defaultQuery} = data
    const SearchQueryTypeName = `
      ${meetingPropertyName.charAt(0)}${meetingPropertyName.slice(1)}
    `
    const queryId = `${meetingPropertyName}:${meetingId}`
    const existingQuery = store.get(queryId)
    if (!existingQuery) {
      const newQuery = createProxyRecord(store, SearchQueryTypeName, defaultQuery)
      meeting.setLinkedRecord(newQuery, meetingPropertyName)
    }
  }
}

const LocalPokerHandler: Handler = {
  update(store, payload) {
    initializeDefaultSearchQueries(store, payload)
  }
}

export default LocalPokerHandler
