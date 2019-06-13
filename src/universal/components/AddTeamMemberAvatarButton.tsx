import {AddTeamMemberAvatarButton_team} from '__generated__/AddTeamMemberAvatarButton_team.graphql'
import {AddTeamMemberAvatarButton_teamMembers} from '__generated__/AddTeamMemberAvatarButton_teamMembers.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import OutlinedButton from 'universal/components/OutlinedButton'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {MenuPosition} from 'universal/hooks/useCoords'
import useTooltip from 'universal/hooks/useTooltip'
import useModal from 'universal/hooks/useModal'
import lazyPreload from 'universal/utils/lazyPreload'
import isDemoRoute from 'universal/utils/isDemoRoute'
import {meetingAvatarMediaQueries} from 'universal/styles/meeting'

interface Props extends WithAtmosphereProps {
  isMeeting?: boolean
  team: AddTeamMemberAvatarButton_team
  teamMembers: AddTeamMemberAvatarButton_teamMembers
}

const AddButton = styled(OutlinedButton)(
  {
    fontSize: 24,
    fontWeight: 400,
    height: 32,
    marginLeft: 12,
    maxWidth: 32,
    padding: 0,
    width: 32
  },
  ({isMeeting}: {isMeeting: boolean}) =>
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

const StyledIcon = styled(Icon)(
  ({isMeeting}: {isMeeting: boolean}) =>
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
        innerRef={originRef}
        isMeeting={isMeeting}
        palette='blue'
      >
        <StyledIcon isMeeting={isMeeting}>add</StyledIcon>
      </AddButton>
      {tooltipPortal('Invite to Team')}
      {modalPortal(modal)}
    </>
  )
}

export default createFragmentContainer(
  withAtmosphere(AddTeamMemberAvatarButton),
  graphql`
    fragment AddTeamMemberAvatarButton_team on Team {
      ...AddTeamMemberModal_team
    }

    fragment AddTeamMemberAvatarButton_teamMembers on TeamMember @relay(plural: true) {
      ...AddTeamMemberModal_teamMembers
    }
  `
)
