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
  const {id: meetingId, facilitatorUserId, meetingMembers} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const promoteViewerToFacilitator = () => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: viewerId, meetingId})
  }
  const promoteRandomPersonToFacilitator = () => {
    const memberIdsWithoutCurrentFacilitator = meetingMembers.filter(({userId}) => userId != facilitatorUserId).map(({userId}) => userId)
    const newFacilitatorId = memberIdsWithoutCurrentFacilitator[Math.floor(Math.random() * memberIdsWithoutCurrentFacilitator.length)]
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: newFacilitatorId, meetingId})
  }
  return (
    <Menu ariaLabel={'Change the facilitator role'} {...menuProps}>
      {viewerId !== facilitatorUserId && <MenuItem
        label={<MenuItemLabel>{'Take the facilitator role'}</MenuItemLabel>}
        onClick={promoteViewerToFacilitator}
      />}
      <MenuItem
        label={<MenuItemLabel>{'Randomize facilitator'}</MenuItemLabel>}
        onClick={promoteRandomPersonToFacilitator}
      />
    </Menu>
  )
}

export default createFragmentContainer(FacilitatorMenu, {
  meeting: graphql`
    fragment FacilitatorMenu_meeting on NewMeeting {
      id
      facilitatorUserId
      meetingMembers {
        userId
      }
    }
  `
})
