import styled from '@emotion/styled'
import {MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import {ManageTeamMember_teamMember$key} from '~/__generated__/ManageTeamMember_teamMember.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import FlatButton from '../../../../components/FlatButton'
import Row from '../../../../components/Row/Row'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import useScrollIntoView from '../../../../hooks/useScrollIntoVIew'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import lazyPreload from '../../../../utils/lazyPreload'
import LeaveTeamModal from '../LeaveTeamModal/LeaveTeamModal'
import PromoteTeamMemberModal from '../PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from '../RemoveTeamMemberModal/RemoveTeamMemberModal'

const StyledRow = styled(Row)({
  borderTop: 0,
  padding: `8px 8px 8px 16px`
})

const StyledButton = styled(FlatButton)<{showMenuButton: boolean}>(({showMenuButton}) => ({
  display: showMenuButton ? 'flex' : 'none',
  fontSize: ICON_SIZE.MD18,
  padding: 0,
  color: PALETTE.SLATE_600
}))

const Name = styled('div')({
  fontSize: 14,
  fontWeight: 400,
  color: PALETTE.SLATE_700,
  lineHeight: '20px',
  padding: '0px 16px',
  wordBreak: 'break-word'
})

const Content = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  flexDirection: 'column'
})

const StyledIcon = styled('div')({
  svg: {
    fontSize: 18
  },
  height: 18,
  width: 18
})

const TeamLeadLabel = styled('div')<{isLead: boolean}>(({isLead}) => ({
  display: isLead ? 'flex' : 'none',
  padding: '0px 16px',
  color: PALETTE.SLATE_800,
  fontSize: 12,
  lineHeight: '12px'
}))

const TeamMemberAvatarMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamMemberAvatarMenu' */ '../../../../components/DashboardAvatars/TeamMemberAvatarMenu'
    )
)

interface Props {
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  manageTeamMemberId?: string | null
  teamMember: ManageTeamMember_teamMember$key
}

const ManageTeamMember = (props: Props) => {
  const {isViewerLead, isViewerOrgAdmin, manageTeamMemberId} = props
  const teamMember = useFragment(
    graphql`
      fragment ManageTeamMember_teamMember on TeamMember {
        ...TeamMemberAvatarMenu_teamMember
        ...LeaveTeamModal_teamMember
        ...PromoteTeamMemberModal_teamMember
        ...RemoveTeamMemberModal_teamMember
        id
        isLead
        isOrgAdmin
        user {
          id
          preferredName
          picture
        }
      }
    `,
    props.teamMember
  )
  const {id: teamMemberId, isLead, isOrgAdmin, user} = teamMember
  const {id: userId, preferredName, picture} = user
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const isSelectedAvatar = manageTeamMemberId === teamMemberId
  // Team management permissions:
  // * Org admin can do anything, including promote themselves to team lead, and remove non-lead
  //   team members
  // * Team leads can do anything, except manage org admins
  // * Non-lead non-admins can only leave the team
  // Show the menu iff:
  // 1. Viewer is an admin, and the user is not a lead (viewer can promote them a lead, or remove
  //    from team).
  // 2. Viewer is a lead, and user is not the viewer, and not an admin (viewer can promote to lead,
  //    or remove from team).
  // 3. User is the viewer, and the user is not a lead (can leave team).
  const showMenuButton =
    (isViewerOrgAdmin && !isLead) ||
    (isViewerLead && !isSelf && !isOrgAdmin) ||
    (!isViewerLead && isSelf)
  const {
    closePortal: closePromote,
    togglePortal: togglePromote,
    modalPortal: portalPromote
  } = useModal()
  const {
    closePortal: closeRemove,
    togglePortal: toggleRemove,
    modalPortal: portalRemove
  } = useModal()
  const {closePortal: closeLeave, togglePortal: toggleLeave, modalPortal: portalLeave} = useModal()
  const {togglePortal, originRef, menuProps, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT)
  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, isSelectedAvatar)

  return (
    <StyledRow ref={ref}>
      <Avatar className='h-6 w-6' picture={picture} />
      <Content>
        <Name>{preferredName}</Name>
        <TeamLeadLabel isLead={isLead || isOrgAdmin}>
          {isLead && 'Team Lead'}
          {isLead && isOrgAdmin && ', '}
          {isOrgAdmin && 'Org Admin'}
        </TeamLeadLabel>
      </Content>
      <StyledButton
        showMenuButton={showMenuButton}
        onClick={togglePortal}
        onMouseEnter={TeamMemberAvatarMenu.preload}
        ref={originRef}
      >
        <StyledIcon>
          <MoreVertIcon />
        </StyledIcon>
      </StyledButton>
      {menuPortal(
        <TeamMemberAvatarMenu
          menuProps={menuProps}
          isLead={isLead}
          isViewerLead={isViewerLead}
          isViewerOrgAdmin={isViewerOrgAdmin}
          teamMember={teamMember}
          togglePromote={togglePromote}
          toggleRemove={toggleRemove}
          toggleLeave={toggleLeave}
        />
      )}
      {portalPromote(<PromoteTeamMemberModal teamMember={teamMember} closePortal={closePromote} />)}
      {portalRemove(<RemoveTeamMemberModal teamMember={teamMember} closePortal={closeRemove} />)}
      {portalLeave(<LeaveTeamModal teamMember={teamMember} closePortal={closeLeave} />)}
    </StyledRow>
  )
}

export default ManageTeamMember
