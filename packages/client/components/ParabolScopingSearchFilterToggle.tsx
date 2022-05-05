import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {ParabolScopingSearchFilterToggle_meeting} from '../__generated__/ParabolScopingSearchFilterToggle_meeting.graphql'
import FilterButton from './FilterButton'
import ParabolScopingSearchFilterMenu from './ParabolScopingSearchFilterMenu'

interface Props {
  meeting: ParabolScopingSearchFilterToggle_meeting
}

const ParabolScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
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

export default createFragmentContainer(ParabolScopingSearchFilterToggle, {
  meeting: graphql`
    fragment ParabolScopingSearchFilterToggle_meeting on PokerMeeting {
      id
      ...ParabolScopingSearchFilterMenu_meeting
    }
  `
})
