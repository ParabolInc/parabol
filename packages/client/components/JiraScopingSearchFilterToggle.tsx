import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import lazyPreload from '../utils/lazyPreload'
import {JiraScopingSearchFilterToggle_meeting$key} from '../__generated__/JiraScopingSearchFilterToggle_meeting.graphql'
import FilterButton from './FilterButton'

const JiraScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'JiraScopingSearchFilterMenuRoot' */ './JiraScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: JiraScopingSearchFilterToggle_meeting$key
}

const JiraScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchFilterToggle_meeting on PokerMeeting {
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
        <JiraScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingId={meetingId}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default JiraScopingSearchFilterToggle
