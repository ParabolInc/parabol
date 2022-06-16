import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import useModal from '../hooks/useModal'
import useRouter from '../hooks/useRouter'
import {ICON_SIZE} from '../styles/typographyV2'
import {InviteTeamMemberAvatar_teamMembers$key} from '../__generated__/InviteTeamMemberAvatar_teamMembers.graphql'
import AddTeamMemberModal from './AddTeamMemberModal'
import Icon from './Icon'

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
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
  },
  ':hover i': {
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
  const {
    togglePortal: toggleModal,
    openPortal: openModal,
    closePortal: closeModal,
    modalPortal
  } = useModal()

  const {location} = useRouter()
  const params = new URLSearchParams(location.search)
  const invite = params.get('invite')

  useEffect(() => {
    invite && openModal()
  }, [invite])

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

export default InviteTeamMemberAvatar
