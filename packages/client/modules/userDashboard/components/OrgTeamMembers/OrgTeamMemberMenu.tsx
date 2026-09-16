import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {OrgTeamMemberMenu_teamMember$key} from '../../../../__generated__/OrgTeamMemberMenu_teamMember.graphql'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'

interface OrgTeamMemberMenuProps {
  isLead: boolean
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  manageTeamMemberId?: string | null
  teamMember: OrgTeamMemberMenu_teamMember$key
  handleNavigate?: () => void
  togglePromote: () => void
  toggleRemove: () => void
}

export const OrgTeamMemberMenu = (props: OrgTeamMemberMenuProps) => {
  const {
    isViewerLead,
    isViewerOrgAdmin,
    teamMember: teamMemberRef,
    togglePromote,
    toggleRemove
  } = props
  const teamMember = useFragment(
    graphql`
      fragment OrgTeamMemberMenu_teamMember on TeamMember {
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
    <MenuContent align='end'>
      {isViewerTeamAdmin && (!isSelf || !isViewerLead) && (
        <MenuItem onClick={togglePromote}>Promote to Team Lead</MenuItem>
      )}
      {isViewerTeamAdmin && !isSelf && <MenuItem onClick={toggleRemove}>Remove from Team</MenuItem>}
    </MenuContent>
  )
}
