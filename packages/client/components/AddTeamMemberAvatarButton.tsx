import styled from '@emotion/styled'
import {PersonAdd} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useModal from '../hooks/useModal'
import useTooltip from '../hooks/useTooltip'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import isDemoRoute from '../utils/isDemoRoute'
import lazyPreload from '../utils/lazyPreload'
import {AddTeamMemberAvatarButton_teamMembers} from '../__generated__/AddTeamMemberAvatarButton_teamMembers.graphql'
import OutlinedButton from './OutlinedButton'

interface Props {
  meetingId?: string
  teamId: string
  teamMembers: AddTeamMemberAvatarButton_teamMembers
}

const AddButton = styled(OutlinedButton)<{isMeeting: boolean | undefined}>(
  {
    borderWidth: 2,
    fontSize: 24,
    fontWeight: 400,
    height: 32,
    maxWidth: 32,
    padding: 0,
    width: 32,
    ':hover, :focus, :active': {
      borderColor: PALETTE.SKY_600,
      color: PALETTE.SKY_600
    }
  },
  ({isMeeting}) =>
    isMeeting && {
      height: 32,
      maxWidth: 32,
      width: 32,
      [meetingAvatarMediaQueries[0]]: {
        borderWidth: 2,
        height: 48,
        maxWidth: 48,
        width: 48
      },
      [meetingAvatarMediaQueries[1]]: {
        height: 56,
        maxWidth: 56,
        width: 56
      }
    }
)

const StyledIcon = styled(PersonAdd)<{isMeeting: boolean}>(
  {
    height: 18,
    width: 18,
    marginLeft: -1
  },
  ({isMeeting}) =>
    isMeeting && {
      height: 18,
      width: 18,
      [meetingAvatarMediaQueries[0]]: {
        height: 24,
        width: 24
      },
      [meetingAvatarMediaQueries[1]]: {
        height: 36,
        width: 36
      }
    }
)

const AddTeamMemberModal = lazyPreload(
  () => import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

const AddTeamMemberModalDemo = lazyPreload(
  () => import(/* webpackChunkName: 'AddTeamMemberModalDemo' */ './AddTeamMemberModalDemo')
)

const AddTeamMemberAvatarButton = (props: Props) => {
  const {meetingId, teamId, teamMembers} = props
  const isMeeting = !!meetingId
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const modal = isDemoRoute() ? (
    <AddTeamMemberModalDemo />
  ) : (
    <AddTeamMemberModal
      closePortal={closeModal}
      meetingId={meetingId}
      teamId={teamId}
      teamMembers={teamMembers}
    />
  )
  return (
    <>
      <AddButton
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onClick={toggleModal}
        ref={originRef}
        isMeeting={isMeeting}
        palette='blue'
      >
        <StyledIcon isMeeting={Boolean(isMeeting)} />
      </AddButton>
      {tooltipPortal('Invite to Team')}
      {modalPortal(modal)}
    </>
  )
}

export default createFragmentContainer(AddTeamMemberAvatarButton, {
  teamMembers: graphql`
    fragment AddTeamMemberAvatarButton_teamMembers on TeamMember @relay(plural: true) {
      ...AddTeamMemberModal_teamMembers
    }
  `
})
