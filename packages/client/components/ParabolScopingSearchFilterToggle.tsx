import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {ParabolScopingSearchFilterToggle_meeting$key} from '../__generated__/ParabolScopingSearchFilterToggle_meeting.graphql'
import FilterButton from './FilterButton'
import ParabolScopingSearchFilterMenu from './ParabolScopingSearchFilterMenu'

interface Props {
  meeting: ParabolScopingSearchFilterToggle_meeting$key
}

const ParabolScopingSearchFilterToggle = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        ...ParabolScopingSearchFilterMenu_meeting
      }
    `,
    meetingRef
  )
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <FilterButton onClick={togglePortal} ref={originRef} />
      {menuPortal(<ParabolScopingSearchFilterMenu meeting={meeting} menuProps={menuProps} />)}
    </>
  )
}

export default ParabolScopingSearchFilterToggle
