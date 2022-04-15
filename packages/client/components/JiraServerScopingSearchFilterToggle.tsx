import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import lazyPreload from '../utils/lazyPreload'
import {JiraServerScopingSearchFilterToggle_meeting$key} from '../__generated__/JiraServerScopingSearchFilterToggle_meeting.graphql'
import FilterButton from './FilterButton'

const JiraServerScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'JiraServerScopingSearchFilterMenuRoot' */ './JiraServerScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: JiraServerScopingSearchFilterToggle_meeting$key
}

const JiraServerScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment JiraServerScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )

  const {id: meetingId, teamId} = meeting

  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <FilterButton onClick={togglePortal} ref={originRef} />
      {menuPortal(
        <JiraServerScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingId={meetingId}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default JiraServerScopingSearchFilterToggle
