import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {ParabolSearchQuery} from '~/types/clientSchema'
import {taskScopingStatusFilters} from '~/utils/constants'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MockScopingList from '../modules/meeting/components/MockScopingList'
import parabolScopingSearchResultsRootQuery, {
  ParabolScopingSearchResultsRootQuery
} from '../__generated__/ParabolScopingSearchResultsRootQuery.graphql'
import {ParabolScopingSearchResultsRoot_meeting$key} from '../__generated__/ParabolScopingSearchResultsRoot_meeting.graphql'
import ErrorBoundary from './ErrorBoundary'
import ParabolScopingSearchResults from './ParabolScopingSearchResults'

interface Props {
  meeting: ParabolScopingSearchResultsRoot_meeting$key
}

const ParabolScopingSearchResultsRoot = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchResultsRoot_meeting on PokerMeeting {
        ...ParabolScopingSearchResults_meeting
        parabolSearchQuery {
          queryString
          statusFilters
        }
        teamId
      }
    `,
    meetingRef
  )
  const {teamId, parabolSearchQuery} = meeting
  const {queryString, statusFilters} = parabolSearchQuery as unknown as ParabolSearchQuery
  const queryRef = useQueryLoaderNow<ParabolScopingSearchResultsRootQuery>(
    parabolScopingSearchResultsRootQuery,
    {
      first: 50,
      teamIds: [teamId],
      userIds: [],
      statusFilters: (statusFilters?.length && statusFilters) || taskScopingStatusFilters,
      filterQuery: queryString!.trim()
    }
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<MockScopingList />}>
        {queryRef && <ParabolScopingSearchResults queryRef={queryRef} meetingRef={meeting} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ParabolScopingSearchResultsRoot
