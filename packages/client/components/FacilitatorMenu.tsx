import {FacilitatorMenu_viewer} from '../__generated__/FacilitatorMenu_viewer.graphql'
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
  viewer: FacilitatorMenu_viewer
}

const FacilitatorMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const {id: userId, team} = viewer
  const {newMeeting} = team!
  const {id: meetingId} = newMeeting!
  const atmosphere = useAtmosphere()
  const promoteToFacilitator = () => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: userId, meetingId})
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
  viewer: graphql`
    fragment FacilitatorMenu_viewer on User {
      id
      team(teamId: $teamId) {
        newMeeting {
          id
        }
      }
    }
  `,
})
