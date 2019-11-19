import {FacilitatorMenu_meeting} from '../__generated__/FacilitatorMenu_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from '../components/Menu'
import MenuItem from '../components/MenuItem'
import MenuItemLabel from '../components/MenuItemLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import PromoteNewMeetingFacilitatorMutation from '../mutations/PromoteNewMeetingFacilitatorMutation'

interface Props {
  menuProps: MenuProps
  meeting: FacilitatorMenu_meeting
}

const FacilitatorMenu = (props: Props) => {
  const {menuProps, meeting} = props
  const {id: meetingId} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const promoteToFacilitator = () => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: viewerId, meetingId})
  }
  return (
    <Menu ariaLabel={'Take the Facilitator role'} {...menuProps}>
      <MenuItem
        label={<MenuItemLabel>{'Take the Facilitator role'}</MenuItemLabel>}
        onClick={promoteToFacilitator}
      />
    </Menu>
  )
}

export default createFragmentContainer(FacilitatorMenu, {
  meeting: graphql`
    fragment FacilitatorMenu_meeting on NewMeeting {
      id
    }
  `
})
