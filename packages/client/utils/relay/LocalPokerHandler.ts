import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'
import {TaskStatusEnum, TaskServiceEnum} from '~/types/graphql'
import upperFirst from '../upperFirst'
import createProxyRecord from './createProxyRecord'
import toSearchQueryId from './toSearchQueryId'

export enum SearchQueryMeetingPropName {
  parabol = 'parabolSearchQuery',
  jira = 'jiraSearchQuery'
}

const lookup = {
  [TaskServiceEnum.jira]: {
    meetingPropertyName: SearchQueryMeetingPropName.jira,
    defaultQuery: {
      queryString: '',
      projectKeyFilters: [],
      isJQL: false
    }
  },
  [TaskServiceEnum.PARABOL]: {
    meetingPropertyName: SearchQueryMeetingPropName.parabol,
    defaultQuery: {
      queryString: '',
      statusFilters: [TaskStatusEnum.active]
    }
  }
}

const initializeDefaultSearchQueries = (store, payload): void => {
  const meetingId = payload.dataID
  const meeting = store.get(meetingId)!

  for (const data of Object.values(lookup)) {
    const {meetingPropertyName, defaultQuery} = data
    const queryId = toSearchQueryId(meetingPropertyName, meetingId)
    const existingQuery = store.get(queryId)
    if (!existingQuery) {
      const newQuery = createProxyRecord(store, upperFirst(meetingPropertyName), {
        id: queryId,
        ...defaultQuery
      })
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
