import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import lazyPreload from '../utils/lazyPreload'
import {GitHubScopingSearchFilterToggle_meeting$key} from '../__generated__/GitHubScopingSearchFilterToggle_meeting.graphql'
import FilterButton from './FilterButton'

const GitHubScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'GitHubScopingSearchFilterMenuRoot' */ './GitHubScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: GitHubScopingSearchFilterToggle_meeting$key
}

const GitHubScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchFilterToggle_meeting on PokerMeeting {
        ...GitHubScopingSearchFilterMenuRoot_meeting
        id
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <FilterButton onClick={togglePortal} ref={originRef} />
      {menuPortal(
        <GitHubScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingRef={meeting}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default GitHubScopingSearchFilterToggle
