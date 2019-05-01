import {TeamMemberAvatarMenu_teamMember} from '__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import MenuItemLabel from '../MenuItemLabel'

interface Props extends WithAtmosphereProps {
  isViewerLead: boolean
  teamMember: TeamMemberAvatarMenu_teamMember
  menuProps: MenuProps
  handleNavigate?: () => void
  togglePromote: () => void
  toggleRemove: () => void
  toggleLeave: () => void
}

const TeamMemberAvatarMenu = (props: Props) => {
  const {
    atmosphere,
    isViewerLead,
    teamMember,
    menuProps,
    togglePromote,
    toggleRemove,
    toggleLeave
  } = props
  const {user, preferredName, userId} = teamMember
  const {isConnected} = user
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const connected = isConnected ? 'connected' : 'disconnected'
  const hasOptions = (isViewerLead && !isSelf) || (!isViewerLead && isSelf)

  return (
    <>
      <Menu ariaLabel={'Select what to do with this team member'} {...menuProps}>
        <DropdownMenuLabel isEmpty={!hasOptions}>{`${
          isSelf ? 'You are' : `${preferredName} is`
        } ${connected}`}</DropdownMenuLabel>
        {isViewerLead && !isSelf && (
          <MenuItem
            key='promote'
            onClick={togglePromote}
            label={<MenuItemLabel>Promote {preferredName} to Team Lead</MenuItemLabel>}
          />
        )}
        {isViewerLead && !isSelf && (
          <MenuItem
            key='remove'
            onClick={toggleRemove}
            label={<MenuItemLabel>Remove {preferredName} from Team</MenuItemLabel>}
          />
        )}
        {!isViewerLead && isSelf && (
          <MenuItem
            key='leave'
            onClick={toggleLeave}
            label={<MenuItemLabel>Leave Team</MenuItemLabel>}
          />
        )}
      </Menu>
    </>
  )
}

export default createFragmentContainer(
  withAtmosphere(TeamMemberAvatarMenu),
  graphql`
    fragment TeamMemberAvatarMenu_teamMember on TeamMember {
      isSelf
      preferredName
      userId
      isLead
      user {
        isConnected
      }
    }
  `
)
