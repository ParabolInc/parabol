import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import linearScopingSearchResultsQuery, {
  LinearScopingSearchResultsQuery
} from '../__generated__/LinearScopingSearchResultsQuery.graphql'
import {LinearScopingSearchResultsRoot_meeting$key} from '../__generated__/LinearScopingSearchResultsRoot_meeting.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {makeLinearIssueFilter} from '../utils/makeLinearIssueFilter'
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
          selectedProjectsIds
        }
      }
    `,
    meetingRef
  )
  const {teamId, linearSearchQuery} = meeting
  const {queryString, selectedProjectsIds} = linearSearchQuery
  const filter = makeLinearIssueFilter(queryString, selectedProjectsIds)
  const queryRef = useQueryLoaderNow<LinearScopingSearchResultsQuery>(
    linearScopingSearchResultsQuery,
    {teamId, filter}
  )
  return (
    <Suspense fallback={<MockScopingList />}>
      {queryRef && <LinearScopingSearchResults queryRef={queryRef} meetingRef={meeting} />}
    </Suspense>
  )
}

export default LinearScopingSearchResultsRoot
