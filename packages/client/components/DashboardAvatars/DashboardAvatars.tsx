import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {Breakpoint, ElementWidth} from '~/types/constEnums'
import useAtmosphere from '../../hooks/useAtmosphere'
import useBreakpoint from '../../hooks/useBreakpoint'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleManageTeamMutation from '../../mutations/ToggleManageTeamMutation'
import {PALETTE} from '../../styles/paletteV3'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import ErrorBoundary from '../ErrorBoundary'
import PlainButton from '../PlainButton/PlainButton'
import DashboardAvatar from './DashboardAvatar'

const AvatarsList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginRight: 6
})

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  left: -4
})

const OverflowWrapper = styled('div')({
  width: ElementWidth.DASHBOARD_AVATAR_OVERLAPPED
})

const OverflowCount = styled('div')({
  alignItems: 'center',
  border: `2px solid ${PALETTE.SLATE_200}`,
  backgroundColor: PALETTE.SKY_400,
  borderRadius: '50%',
  display: 'flex',
  height: 28,
  justifyContent: 'center',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  overflow: 'hidden',
  userSelect: 'none',
  width: ElementWidth.DASHBOARD_AVATAR,
  '&:hover': {
    cursor: 'pointer'
  }
})

const StyledButton = styled(PlainButton)({
  fontSize: 12,
  height: 12,
  lineHeight: 1,
  fontWeight: 600,
  color: PALETTE.SLATE_700,
  textAlign: 'center',
  width: '100%',
  '&:hover': {
    cursor: 'pointer'
  }
})

interface Props {
  team: DashboardAvatars_team
}

const DashboardAvatars = (props: Props) => {
  const {team} = props
  const {id: teamId, teamMembers} = team
  const isDesktop = useBreakpoint(Breakpoint.DASHBOARD_TOP_BAR)
  const maxAvatars = isDesktop ? 10 : 6
  const overflowCount = teamMembers.length > maxAvatars ? teamMembers.length - maxAvatars + 1 : 0
  const visibleAvatars = overflowCount === 0 ? teamMembers : teamMembers.slice(0, maxAvatars - 1)
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()

  const handleClick = (clickedOverflow: boolean) => {
    if (!submitting) {
      submitMutation()
      ToggleManageTeamMutation(atmosphere, {teamId}, {onError, onCompleted})
      commitLocalUpdate(atmosphere, (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        const teamMember = viewer?.getLinkedRecord('teamMember', {teamId})
        if (!teamMember) return
        const memberInFocus = teamMembers[clickedOverflow ? maxAvatars - 1 : 0]
        const {id: teamMemberId} = memberInFocus
        teamMember.setValue(teamMemberId, 'manageTeamMemberId')
      })
    }
  }

  return (
    <AvatarsList>
      <Wrapper>
        {visibleAvatars.map((teamMember) => {
          return (
            <ErrorBoundary key={`dbAvatar${teamMember.id}`}>
              <DashboardAvatar teamMember={teamMember} />
            </ErrorBoundary>
          )
        })}
        {overflowCount > 0 && (
          <OverflowWrapper onClick={() => handleClick(true)}>
            <OverflowCount>{`+${overflowCount}`}</OverflowCount>
          </OverflowWrapper>
        )}
      </Wrapper>
      <StyledButton onClick={() => handleClick(false)}>Manage Team</StyledButton>
    </AvatarsList>
  )
}

export default createFragmentContainer(DashboardAvatars, {
  team: graphql`
    fragment DashboardAvatars_team on Team {
      id
      teamMembers(sortBy: "preferredName") {
        ...AddTeamMemberAvatarButton_teamMembers
        ...DashboardAvatar_teamMember
        id
        preferredName
      }
    }
  `
})
