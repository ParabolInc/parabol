import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'
import {TaskStatusEnum, TaskServiceEnum} from '~/types/graphql'
import upperFirst from '../upperFirst'
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
    const existingQuery = meeting.getLinkedRecord(meetingPropertyName)
    if (!existingQuery) {
      const newQuery = createProxyRecord(
        store, upperFirst(meetingPropertyName), defaultQuery)
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
