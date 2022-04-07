import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import azureDevOpsScopingSearchResultsQuery, {
  AzureDevOpsScopingSearchResultsQuery
} from '../__generated__/AzureDevOpsScopingSearchResultsQuery.graphql'
import {AzureDevOpsScopingSearchResultsRoot_meeting$key} from '../__generated__/AzureDevOpsScopingSearchResultsRoot_meeting.graphql'
import AzureDevOpsScopingSearchResults from './AzureDevOpsScopingSearchResults'

interface Props {
  meetingRef: AzureDevOpsScopingSearchResultsRoot_meeting$key
}

const AzureDevOpsScopingSearchResultsRoot = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchResultsRoot_meeting on PokerMeeting {
        ...AzureDevOpsScopingSearchResults_meeting
        teamId
        # azureDevOpsSearchQuery {
        #   queryString
        # }
      }
    `,
    meetingRef
  )
  // const {teamId, azureDevOpsSearchQuery} = meeting
  const {teamId} = meeting
  // const {queryString} = azureDevOpsSearchQuery
  // const normalizedQueryString = queryString.trim()
  const queryRef = useQueryLoaderNow<AzureDevOpsScopingSearchResultsQuery>(
    azureDevOpsScopingSearchResultsQuery,
    {teamId}
  )
  return (
    <Suspense fallback={<MockScopingList />}>
      {queryRef && <AzureDevOpsScopingSearchResults queryRef={queryRef} meetingRef={meeting} />}
    </Suspense>
  )
}

export default AzureDevOpsScopingSearchResultsRoot
