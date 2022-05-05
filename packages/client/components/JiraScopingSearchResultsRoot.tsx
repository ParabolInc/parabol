import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import jiraScopingSearchResultsQuery, {
  JiraScopingSearchResultsQuery
} from '../__generated__/JiraScopingSearchResultsQuery.graphql'
import {JiraScopingSearchResultsRoot_meeting} from '../__generated__/JiraScopingSearchResultsRoot_meeting.graphql'
import ErrorBoundary from './ErrorBoundary'
import JiraScopingSearchResults from './JiraScopingSearchResults'

interface Props {
  meeting: JiraScopingSearchResultsRoot_meeting
}

const JiraScopingSearchResultsRoot = (props: Props) => {
  const {meeting} = props
  const {teamId, jiraSearchQuery} = meeting
  const {queryString, projectKeyFilters, isJQL} = jiraSearchQuery
  const normalizedQueryString = queryString.trim()
  const queryRef = useQueryLoaderNow<JiraScopingSearchResultsQuery>(jiraScopingSearchResultsQuery, {
    teamId,
    queryString: normalizedQueryString,
    isJQL,
    projectKeyFilters: projectKeyFilters as string[],
    first: 100
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<MockScopingList />}>
        {queryRef && <JiraScopingSearchResults queryRef={queryRef} meeting={meeting} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default createFragmentContainer(JiraScopingSearchResultsRoot, {
  meeting: graphql`
    fragment JiraScopingSearchResultsRoot_meeting on PokerMeeting {
      ...JiraScopingSearchResults_meeting
      teamId
      jiraSearchQuery {
        queryString
        projectKeyFilters
        isJQL
      }
    }
  `
})
