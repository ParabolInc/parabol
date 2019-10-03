import {AssignFacilitatorMenu_team} from '../__generated__/AssignFacilitatorMenu_team.graphql'
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
  team: AssignFacilitatorMenu_team
}

const AssignFacilitatorMenu = (props: Props) => {
  const {menuProps, team} = props
  const {newMeeting} = team
  if (!newMeeting) return null
  const {facilitatorUserId, id: meetingId} = newMeeting
  const {teamMembers} = team || {teamMembers: []}
  const assignees = useMemo(
    () => teamMembers
      .filter((teamMember) => teamMember.userId !== facilitatorUserId)
      .sort((a,b) => (a.preferredName > b.preferredName) ? 1 : ((b.preferredName > a.preferredName) ? -1 : 0)),
    [facilitatorUserId, teamMembers]
  )
  const atmosphere = useAtmosphere()
  const promoteToFacilitator = (newAssignee) => () => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: newAssignee.userId, meetingId})
  }
  return (
    <Menu ariaLabel={'Promote to Facilitator'} {...menuProps}>
      <DropdownMenuLabel>Promote to Facilitator</DropdownMenuLabel>
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
  team: graphql`
    fragment AssignFacilitatorMenu_team on Team {
      id
      newMeeting {
        id
        facilitatorUserId
      }
      teamMembers(sortBy: "checkInOrder") {
        id
        picture
        preferredName
        userId
      }
    }
  `,
})
