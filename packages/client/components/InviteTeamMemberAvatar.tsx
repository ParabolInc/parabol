import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import useModal from '../hooks/useModal'
import {InviteTeamMemberAvatar_teamMembers} from '../__generated__/InviteTeamMemberAvatar_teamMembers.graphql'
import {PALETTE} from '~/styles/paletteV3'
import AddTeamMemberModal from './AddTeamMemberModal'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

interface Props extends WithAtmosphereProps {
  meetingId?: string
  teamId: string
  teamMembers: InviteTeamMemberAvatar_teamMembers
}

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '12px',
  color: PALETTE.SLATE_700,
  textAlign: 'center'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SKY_500,
  fontSize: ICON_SIZE.MD24,
  alignSelf: 'center'
})

const IconWrapper = styled('div')({
  height: 28,
  display: 'flex',
  justifyContent: 'center'
})

const Wrapper = styled('div')({
  margin: '0 6px',
  ':hover': {
    cursor: 'pointer'
  }
})

const InviteTeamMemberAvatar = (props: Props) => {
  const {meetingId, teamId, teamMembers} = props
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  return (
    <>
      <Wrapper onClick={toggleModal}>
        <IconWrapper>
          <StyledIcon>person_add</StyledIcon>
        </IconWrapper>
        <Label>Invite</Label>
      </Wrapper>
      {modalPortal(
        <AddTeamMemberModal
          closePortal={closeModal}
          meetingId={meetingId}
          teamId={teamId}
          teamMembers={teamMembers}
        />
      )}
    </>
  )
}

export default createFragmentContainer(withAtmosphere(InviteTeamMemberAvatar), {
  teamMembers: graphql`
    fragment InviteTeamMemberAvatar_teamMembers on TeamMember @relay(plural: true) {
      ...AddTeamMemberModal_teamMembers
    }
  `
})
