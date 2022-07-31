import styled from '@emotion/styled'
import PersonAdd from '@mui/icons-material/PersonAdd'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import useModal from '../hooks/useModal'
import {InviteTeamMemberAvatar_teamMembers$key} from '../__generated__/InviteTeamMemberAvatar_teamMembers.graphql'
import AddTeamMemberModal from './AddTeamMemberModal'

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  color: PALETTE.SLATE_700,
  textAlign: 'center'
})

const StyledIcon = styled('span')({
  color: PALETTE.SKY_500,
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
  },
  ':hover span': {
    color: PALETTE.SKY_600
  }
})

interface Props {
  meetingId?: string
  teamId: string
  teamMembers: InviteTeamMemberAvatar_teamMembers$key
}

const InviteTeamMemberAvatar = (props: Props) => {
  const {meetingId, teamId} = props
  const teamMembers = useFragment(
    graphql`
      fragment InviteTeamMemberAvatar_teamMembers on TeamMember @relay(plural: true) {
        ...AddTeamMemberModal_teamMembers
      }
    `,
    props.teamMembers
  )
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  return (
    <>
      <Wrapper onClick={toggleModal}>
        <IconWrapper>
          <StyledIcon>
            <PersonAdd />
          </StyledIcon>
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

export default InviteTeamMemberAvatar
