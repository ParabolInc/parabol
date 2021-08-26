import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ManageTeamMember_teamMember} from '~/__generated__/ManageTeamMember_teamMember.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV3'
import FlatButton from '../../../../components/FlatButton'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import PromoteTeamMemberModal from '../PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from '../RemoveTeamMemberModal/RemoveTeamMemberModal'
import LeaveTeamModal from '../LeaveTeamModal/LeaveTeamModal'
import useModal from '../../../../hooks/useModal'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import lazyPreload from '../../../../utils/lazyPreload'

const StyledRow = styled(Row)({
  borderTop: 0,
  padding: `8px 8px 8px 16px`
})

const StyledButton = styled(FlatButton)<{showMenuButton: boolean}>(({showMenuButton}) => ({
  display: showMenuButton ? 'flex' : 'none',
  fontSize: ICON_SIZE.MD18,
  padding: 0
}))

const Name = styled('div')({
  fontSize: 14,
  fontWeight: 400,
  color: PALETTE.SLATE_700,
  lineHeight: '20px',
  padding: '0px 16px'
})

const Content = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  flexDirection: 'column'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

const TeamLeadCopy = styled('div')<{isLead: boolean}>(({isLead}) => ({
  display: isLead ? 'flex' : 'none',
  padding: '0px 16px',
  color: PALETTE.SLATE_600,
  fontSize: 12,
  lineHeight: '12px'
}))

const TeamMemberAvatarMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamMemberAvatarMenu' */ '../../../../components/DashboardAvatars/TeamMemberAvatarMenu'
  )
)

interface Props {
  isViewerLead: boolean
  teamMember: ManageTeamMember_teamMember
}

const ManageTeamMember = (props: Props) => {
  const {isViewerLead, teamMember} = props
  const {isLead, preferredName, picture, userId} = teamMember
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const showMenuButton = (isViewerLead && !isSelf) || (!isViewerLead && isSelf)
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

  return (
    <StyledRow>
      <Avatar size={24} picture={picture} />
      <Content>
        <Name>{preferredName}</Name>
        <TeamLeadCopy isLead={isLead}>Team Lead</TeamLeadCopy>
      </Content>
      <StyledButton
        palette='mid'
        showMenuButton={showMenuButton}
        onClick={togglePortal}
        onMouseEnter={TeamMemberAvatarMenu.preload}
        ref={originRef}
      >
        <StyledIcon>more_vert</StyledIcon>
      </StyledButton>
      {menuPortal(
        <TeamMemberAvatarMenu
          menuProps={menuProps}
          isLead={isLead}
          isViewerLead={isViewerLead}
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

export default createFragmentContainer(ManageTeamMember, {
  teamMember: graphql`
    fragment ManageTeamMember_teamMember on TeamMember {
      ...TeamMemberAvatarMenu_teamMember
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
      isLead
      preferredName
      picture
      userId
    }
  `
})
