import {AssignFacilitatorMenu_newMeeting} from '../__generated__/AssignFacilitatorMenu_newMeeting.graphql'
import {AssignFacilitatorMenu_viewer} from '../__generated__/AssignFacilitatorMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../components/DropdownMenuLabel'
import Menu from '../components/Menu'
import MenuAvatar from '../components/MenuAvatar'
import MenuItem from '../components/MenuItem'
import MenuItemLabel from '../components/MenuItemLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import PromoteNewMeetingFacilitatorMutation from '../mutations/PromoteNewMeetingFacilitatorMutation'
import avatarUser from '../styles/theme/images/avatar-user.svg'

interface Props {
  menuProps: MenuProps
  viewer: AssignFacilitatorMenu_viewer
  newMeeting: AssignFacilitatorMenu_newMeeting
}

const AssignFacilitatorMenu = (props: Props) => {
  const {menuProps, viewer, newMeeting} = props
  const {team} = viewer
  console.log('--- team AssignFacilitatorMenu props ---')
  console.dir(team)
  const {teamMembers} = team || {teamMembers: []}
  // const {teamMembers} = {teamMembers: []}
  const {facilitatorUserId, meetingId} = newMeeting
  const assignees = useMemo(
    () => teamMembers.filter((teamMember) => teamMember.userId !== facilitatorUserId),
    [facilitatorUserId, teamMembers]
  )
  const atmosphere = useAtmosphere()
  if (!team) return null

  const promoteToFacilitator = (newAssignee) => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: newAssignee.userId, meetingId})
  }

  return (
    <Menu ariaLabel={'Promote to Facilitator'} {...menuProps}>
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {assignees.map((assignee) => {
        return (
          <MenuItem
            key={assignee.id}
            label={
              <MenuItemLabel>
                <MenuAvatar alt={assignee.preferredName} src={assignee.picture || avatarUser} />
                {assignee.preferredName}
              </MenuItemLabel>
            }
            onClick={promoteToFacilitator(assignee)}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(AssignFacilitatorMenu, {
  viewer: graphql`
    fragment AssignFacilitatorMenu_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
          userId
        }
      }
    }
  `,
  newMeeting: graphql`
    fragment AssignFacilitatorMenu_newMeeting on NewMeeting {
      meetingId: id
      facilitatorUserId
    }
  `
})
