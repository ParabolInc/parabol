import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {createFragmentContainer} from 'react-relay'
import {SpotlightModal_meeting} from '~/__generated__/SpotlightModal_meeting.graphql'
import {MeetingControlBarEnum, NavSidebar} from '../types/constEnums'

interface Props {
  meeting: SpotlightModal_meeting
}

const StyledMenu = styled(Menu)<{showSidebar: boolean}>(({showSidebar}) => ({
  position: 'fixed',
  minHeight: `calc(100vw - ${0}px)`,
  height: `calc(100vw - ${0}px)`,
  minWidth: `calc(100vw - ${showSidebar ? NavSidebar.WIDTH : 0}px)`,
  right: 0,
  // top: 0,
  border: '2px solid red',
  backgroundColor: '#FFFF',
  borderRadius: 4
}))

const StyledMenuItem = styled(MenuItem)({
  position: 'relative',
  border: '2px solid red'
})

const ModalContainer = styled('div')<{showSidebar: boolean}>(({showSidebar}) => ({
  border: '2px solid red',
  width: `calc(100vw - ${showSidebar ? NavSidebar.WIDTH : 0}px)`,
  height: `calc(100vh - ${MeetingControlBarEnum.HEIGHT}px)`,
  right: 0,
  position: 'fixed',
  top: 0
}))

const SpotlightModal = (props: Props) => {
  const {meeting} = props
  const {showSidebar} = meeting
  return (
    // <StyledMenu ariaLabel='Search for similar reflections' {...menuProps} showSidebar={showSidebar}>
    <ModalContainer showSidebar={showSidebar}>test</ModalContainer>
    // </StyledMenu>
  )
}

export default createFragmentContainer(SpotlightModal, {
  meeting: graphql`
    fragment SpotlightModal_meeting on RetrospectiveMeeting {
      showSidebar
    }
  `
})
