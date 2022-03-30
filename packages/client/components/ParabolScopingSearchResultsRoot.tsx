import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {createFragmentContainer, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import ParabolScopingSearchResults from './ParabolScopingSearchResults'
import {ParabolScopingSearchResultsRoot_meeting} from '../__generated__/ParabolScopingSearchResultsRoot_meeting.graphql'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import parabolScopingSearchResultsRootQuery, {
  ParabolScopingSearchResultsRootQuery
} from '../__generated__/ParabolScopingSearchResultsRootQuery.graphql'
import {ParabolSearchQuery} from '~/types/clientSchema'
import {taskScopingStatusFilters} from '~/utils/constants'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import ErrorBoundary from './ErrorBoundary'

const query = graphql`
  query ParabolScopingSearchResultsRootQuery(
    $first: Int!
    $after: DateTime
    $userIds: [ID!]
    $teamIds: [ID!]
    $statusFilters: [TaskStatusEnum!]
    $filterQuery: String
  ) {
    viewer {
      ...ParabolScopingSearchResults_viewer
    }
  }
`

interface Props {
  meeting: ParabolScopingSearchResultsRoot_meeting
}

const ParabolScopingSearchResultsRoot = (props: Props) => {
  const {meeting} = props
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
    <ErrorBoundary fallback={(error) => <ErrorComponent error={error} eventId={''} />}>
      <Suspense fallback={''}>
        {queryRef && <ParabolScopingSearchResultsContainer meeting={meeting} queryRef={queryRef} />}
      </Suspense>
    </ErrorBoundary>
  )
}

interface ParabolScopingSearchResultsContainerProps {
  queryRef: PreloadedQuery<ParabolScopingSearchResultsRootQuery>
  meeting: ParabolScopingSearchResultsRoot_meeting
}

function ParabolScopingSearchResultsContainer(props: ParabolScopingSearchResultsContainerProps) {
  const {queryRef, meeting} = props
  const data = usePreloadedQuery<ParabolScopingSearchResultsRootQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  return <ParabolScopingSearchResults viewer={viewer} meeting={meeting} />
}

export default createFragmentContainer(ParabolScopingSearchResultsRoot, {
  meeting: graphql`
    fragment ParabolScopingSearchResultsRoot_meeting on PokerMeeting {
      ...ParabolScopingSearchResults_meeting
      parabolSearchQuery {
        queryString
        statusFilters
      }
      teamId
    }
  `
})
