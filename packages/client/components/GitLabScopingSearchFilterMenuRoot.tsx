import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import gitlabScopingSearchFilterMenuQuery, {
  GitLabScopingSearchFilterMenuQuery
} from '../__generated__/GitLabScopingSearchFilterMenuQuery.graphql'
import {GitLabScopingSearchFilterMenuRoot_meeting$key} from '../__generated__/GitLabScopingSearchFilterMenuRoot_meeting.graphql'
import GitLabScopingSearchFilterMenu from './GitLabScopingSearchFilterMenu'
import MockFieldList from './MockFieldList'

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingRef: GitLabScopingSearchFilterMenuRoot_meeting$key
}

const GitLabScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingRef} = props
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
      {queryRef && <GitLabScopingSearchFilterMenu queryRef={queryRef} menuProps={menuProps} />}
    </Suspense>
  )
}

export default GitLabScopingSearchFilterMenuRoot
