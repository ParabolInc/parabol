import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {TeamMemberAvatarMenu_teamMember$key} from '../../__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import type {MenuProps} from '../../hooks/useMenu'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import MenuItemLabel from '../MenuItemLabel'

interface Props {
  isLead: boolean
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  teamMember: TeamMemberAvatarMenu_teamMember$key
  menuProps: MenuProps
  handleNavigate?: () => void
  togglePromote: () => void
  toggleRemove: () => void
  toggleLeave: () => void
}

const TeamMemberAvatarMenu = (props: Props) => {
  const {
    isViewerLead,
    isViewerOrgAdmin,
    teamMember: teamMemberRef,
    menuProps,
    togglePromote,
    toggleRemove,
    toggleLeave
  } = props
  const teamMember = useFragment(
    graphql`
      fragment TeamMemberAvatarMenu_teamMember on TeamMember {
        isSelf
        userId
        isLead
      }
    `,
    teamMemberRef
  )
  const atmosphere = useAtmosphere()
  const {userId} = teamMember
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const isViewerTeamAdmin = isViewerLead || isViewerOrgAdmin

  return (
    <Menu ariaLabel={'Select what to do with this team member'} {...menuProps}>
      {isViewerTeamAdmin && (!isSelf || !isViewerLead) && (
        <MenuItem
          key='promote'
          onClick={togglePromote}
          label={<MenuItemLabel>Promote to Team Lead</MenuItemLabel>}
        />
      )}
      {isViewerTeamAdmin && !isSelf && (
        <MenuItem
          key='remove'
          onClick={toggleRemove}
          label={<MenuItemLabel>Remove from Team</MenuItemLabel>}
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
  )
}

export default TeamMemberAvatarMenu
