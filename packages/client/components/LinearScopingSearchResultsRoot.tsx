import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import linearScopingSearchResultsQuery, {
  LinearScopingSearchResultsQuery
} from '../__generated__/LinearScopingSearchResultsQuery.graphql'
import {LinearScopingSearchResultsRoot_meeting$key} from '../__generated__/LinearScopingSearchResultsRoot_meeting.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import LinearScopingSearchResults from './LinearScopingSearchResults'
interface Props {
  meetingRef: LinearScopingSearchResultsRoot_meeting$key
}

const LinearScopingSearchResultsRoot = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment LinearScopingSearchResultsRoot_meeting on PokerMeeting {
        ...LinearScopingSearchResults_meeting
        teamId
        linearSearchQuery {
          queryString
        }
      }
    `,
    meetingRef
  )
  const {teamId, linearSearchQuery} = meeting
  const {queryString} = linearSearchQuery
  const normalizedQueryString = queryString.trim()
  const queryRef = useQueryLoaderNow<LinearScopingSearchResultsQuery>(
    linearScopingSearchResultsQuery,
    {teamId, queryString: normalizedQueryString}
  )
  return (
    <Suspense fallback={<MockScopingList />}>
      {queryRef && <LinearScopingSearchResults queryRef={queryRef} meetingRef={meeting} />}
    </Suspense>
  )
}

export default LinearScopingSearchResultsRoot
