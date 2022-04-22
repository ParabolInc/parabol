import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import lazyPreload from '../utils/lazyPreload'
import {JiraScopingSearchFilterToggle_meeting} from '../__generated__/JiraScopingSearchFilterToggle_meeting.graphql'
import FlatButton from './FlatButton'
import Icon from './Icon'

const StyledButton = styled(FlatButton)({
  height: 24,
  marginLeft: 4,
  padding: 0,
  width: 24,
  background: PALETTE.SKY_500,
  '&:hover': {
    background: PALETTE.SKY_500
  }
})

const FilterIcon = styled(Icon)({
  color: PALETTE.WHITE,
  fontSize: ICON_SIZE.MD18
})

const JiraScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'JiraScopingSearchFilterMenuRoot' */ './JiraScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meeting: JiraScopingSearchFilterToggle_meeting
}

const JiraScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, teamId} = meeting
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <StyledButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </StyledButton>
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

export default createFragmentContainer(JiraScopingSearchFilterToggle, {
  meeting: graphql`
    fragment JiraScopingSearchFilterToggle_meeting on PokerMeeting {
      id
      teamId
    }
  `
})
