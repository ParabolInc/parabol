import {AddTeamMemberAvatarButton_team} from '../__generated__/AddTeamMemberAvatarButton_team.graphql'
import {AddTeamMemberAvatarButton_teamMembers} from '../__generated__/AddTeamMemberAvatarButton_teamMembers.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from './Icon'
import OutlinedButton from './OutlinedButton'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import useModal from '../hooks/useModal'
import lazyPreload from '../utils/lazyPreload'
import isDemoRoute from '../utils/isDemoRoute'
import {meetingAvatarMediaQueries} from '../styles/meeting'

interface Props extends WithAtmosphereProps {
  isMeeting?: boolean
  team: AddTeamMemberAvatarButton_team
  teamMembers: AddTeamMemberAvatarButton_teamMembers
}

const AddButton = styled(OutlinedButton)<{isMeeting: boolean | undefined}>(
  {
    fontSize: 24,
    fontWeight: 400,
    height: 32,
    marginLeft: 12,
    maxWidth: 32,
    padding: 0,
    width: 32
  },
  ({isMeeting}) =>
    isMeeting && {
      height: 32,
      maxWidth: 32,
      width: 32,
      [meetingAvatarMediaQueries[0]]: {
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

const StyledIcon = styled(Icon)<{isMeeting: boolean}>(
  ({isMeeting}) =>
    isMeeting && {
      fontSize: 24,
      [meetingAvatarMediaQueries[1]]: {
        fontSize: 36
      }
    }
)

const AddTeamMemberModal = lazyPreload(() =>
  import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

const AddTeamMemberModalDemo = lazyPreload(() =>
  import(/* webpackChunkName: 'AddTeamMemberModalDemo' */ './AddTeamMemberModalDemo')
)

const AddTeamMemberAvatarButton = (props: Props) => {
  const {isMeeting, team, teamMembers} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip(
    MenuPosition.UPPER_CENTER
  )
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const modal = isDemoRoute() ? (
    <AddTeamMemberModalDemo />
  ) : (
    <AddTeamMemberModal closePortal={closeModal} team={team} teamMembers={teamMembers} />
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
        <StyledIcon isMeeting={Boolean(isMeeting)}>add</StyledIcon>
      </AddButton>
      {tooltipPortal('Invite to Team')}
      {modalPortal(modal)}
    </>
  )
}

export default createFragmentContainer(withAtmosphere(AddTeamMemberAvatarButton), {
  team: graphql`
    fragment AddTeamMemberAvatarButton_team on Team {
      ...AddTeamMemberModal_team
    }
  `,
  teamMembers: graphql`
    fragment AddTeamMemberAvatarButton_teamMembers on TeamMember @relay(plural: true) {
      ...AddTeamMemberModal_teamMembers
    }
  `
})
