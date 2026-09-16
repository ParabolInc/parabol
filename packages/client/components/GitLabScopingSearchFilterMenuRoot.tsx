import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import gitlabScopingSearchFilterMenuQuery, {
  type GitLabScopingSearchFilterMenuQuery
} from '../__generated__/GitLabScopingSearchFilterMenuQuery.graphql'
import type {GitLabScopingSearchFilterMenuRoot_meeting$key} from '../__generated__/GitLabScopingSearchFilterMenuRoot_meeting.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import GitLabScopingSearchFilterMenu from './GitLabScopingSearchFilterMenu'
import MockFieldList from './MockFieldList'

interface Props {
  teamId: string
  meetingRef: GitLabScopingSearchFilterMenuRoot_meeting$key
}

const GitLabScopingSearchFilterMenuRoot = (props: Props) => {
  const {teamId, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchFilterMenuRoot_meeting on PokerMeeting {
        id
      }
    `,
    meetingRef
  )
  const {id: meetingId} = meeting
  const queryRef = useQueryLoaderNow<GitLabScopingSearchFilterMenuQuery>(
    gitlabScopingSearchFilterMenuQuery,
    {meetingId, teamId}
  )

  if (!meetingId) return null

  return (
    <Suspense fallback={<MockFieldList />}>
      {queryRef && <GitLabScopingSearchFilterMenu queryRef={queryRef} />}
    </Suspense>
  )
}

export default GitLabScopingSearchFilterMenuRoot
