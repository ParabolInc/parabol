import {TeamMemberAvatarMenu_teamMember} from '../../__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../DropdownMenuLabel'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from '../../hooks/useMenu'
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

export default createFragmentContainer(withAtmosphere(TeamMemberAvatarMenu), {
  teamMember: graphql`
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
})
