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
import TeamMemberAvatarMenu from '../../../../components/DashboardAvatars/TeamMemberAvatarMenu'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'

const StyledRow = styled(Row)({
  borderTop: 0,
  padding: `8px 8px 8px 16px`
})

const StyledButton = styled(FlatButton)({
  color: PALETTE.GRAPE_700,
  fontSize: ICON_SIZE.MD18,
  userSelect: 'none',
  padding: 0
})

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

interface Props {
  teamMember: ManageTeamMember_teamMember
}

const ManageTeamMember = (props: Props) => {
  const {teamMember} = props
  const {isLead, preferredName, picture} = teamMember
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
      <StyledButton onClick={togglePortal} ref={originRef}>
        <StyledIcon>more_vert</StyledIcon>
      </StyledButton>
      {menuPortal(
        <TeamMemberAvatarMenu
          menuProps={menuProps}
          isLead={Boolean(isLead)}
          isViewerLead={true} // TODO: change
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
    }
  `
})
