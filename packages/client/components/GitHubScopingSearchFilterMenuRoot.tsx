import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import githubScopingSearchFilterMenuQuery, {
  GitHubScopingSearchFilterMenuQuery
} from '../__generated__/GitHubScopingSearchFilterMenuQuery.graphql'
import {GitHubScopingSearchFilterMenuRoot_meeting$key} from '../__generated__/GitHubScopingSearchFilterMenuRoot_meeting.graphql'
import {MenuProps} from '../hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import GitHubScopingSearchFilterMenu from './GitHubScopingSearchFilterMenu'
import MockFieldList from './MockFieldList'

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingRef: GitHubScopingSearchFilterMenuRoot_meeting$key
}

const GitHubScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchFilterMenuRoot_meeting on PokerMeeting {
        id
      }
    `,
    meetingRef
  )
  const {id: meetingId} = meeting
  const queryRef = useQueryLoaderNow<GitHubScopingSearchFilterMenuQuery>(
    githubScopingSearchFilterMenuQuery,
    {meetingId, teamId}
  )

  if (!meetingId) return null

  return (
    <Suspense fallback={<MockFieldList />}>
      {queryRef && <GitHubScopingSearchFilterMenu queryRef={queryRef} menuProps={menuProps} />}
    </Suspense>
  )
}

export default GitHubScopingSearchFilterMenuRoot
