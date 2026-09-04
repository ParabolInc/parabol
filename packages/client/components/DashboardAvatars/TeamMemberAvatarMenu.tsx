import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {TeamMemberAvatarMenu_teamMember$key} from '../../__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'

interface Props {
  isLead: boolean
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  teamMember: TeamMemberAvatarMenu_teamMember$key
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
    <MenuContent align='start'>
      {isViewerTeamAdmin && (!isSelf || !isViewerLead) && (
        <MenuItem onClick={togglePromote}>Promote to Team Lead</MenuItem>
      )}
      {isViewerTeamAdmin && !isSelf && <MenuItem onClick={toggleRemove}>Remove from Team</MenuItem>}
      {!isViewerLead && isSelf && <MenuItem onClick={toggleLeave}>Leave Team</MenuItem>}
    </MenuContent>
  )
}

export default TeamMemberAvatarMenu
