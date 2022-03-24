import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import githubScopingSearchResultsQuery, {
  GitHubScopingSearchResultsQuery
} from '../__generated__/GitHubScopingSearchResultsQuery.graphql'
import {GitHubScopingSearchResultsRoot_meeting$key} from '../__generated__/GitHubScopingSearchResultsRoot_meeting.graphql'
import GitHubScopingSearchResults from './GitHubScopingSearchResults'
interface Props {
  meetingRef: GitHubScopingSearchResultsRoot_meeting$key
}

const GitHubScopingSearchResultsRoot = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchResultsRoot_meeting on PokerMeeting {
        ...GitHubScopingSearchResults_meeting
        teamId
        githubSearchQuery {
          queryString
        }
      }
    `,
    meetingRef
  )
  const {teamId, githubSearchQuery} = meeting
  const {queryString} = githubSearchQuery
  const normalizedQueryString = queryString.trim()
  const queryRef = useQueryLoaderNow<GitHubScopingSearchResultsQuery>(
    githubScopingSearchResultsQuery,
    {teamId, queryString: normalizedQueryString}
  )
  return (
    <Suspense fallback={<MockScopingList />}>
      {queryRef && <GitHubScopingSearchResults queryRef={queryRef} meetingRef={meeting} />}
    </Suspense>
  )
}

export default GitHubScopingSearchResultsRoot
