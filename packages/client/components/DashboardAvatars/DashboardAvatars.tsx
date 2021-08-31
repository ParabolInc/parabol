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
import makeMinWidthMediaQuery from '../../utils/makeMinWidthMediaQuery'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import ErrorBoundary from '../ErrorBoundary'
import DashboardAvatar from './DashboardAvatar'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.DASHBOARD_TOP_BAR)

const AvatarsList = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  [desktopBreakpoint]: {
    marginRight: 6
  }
})

const Wrapper = styled('div')<{totalAvatarCount: number}>(({totalAvatarCount}) => ({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  left: `${totalAvatarCount > 1 ? -4 : 0}px`,
  minWidth: `${ElementWidth.DASHBOARD_AVATAR_OVERLAPPED * (totalAvatarCount - 1) +
    ElementWidth.DASHBOARD_AVATAR +
    4}px` // 4px = border
}))

const ItemBlock = styled('div')({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  marginRight: 0
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
  width: 28,
  zIndex: 10,
  '&:hover': {
    cursor: 'pointer'
  }
})

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  color: PALETTE.SLATE_700,
  textAlign: 'center',
  width: 'max-content',
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
  const totalAvatarCount = overflowCount ? visibleAvatars.length + 1 : visibleAvatars.length
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()

  const handleClickOverflow = () => {
    if (!submitting) {
      submitMutation()
      ToggleManageTeamMutation(atmosphere, {teamId}, {onError, onCompleted})
      commitLocalUpdate(atmosphere, (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        const teamMember = viewer?.getLinkedRecord('teamMember', {teamId})
        if (!teamMember) return
        const firstOverflowMember = teamMembers[maxAvatars - 1]
        const {id: teamMemberId} = firstOverflowMember
        teamMember.setValue(teamMemberId, 'manageTeamMemberId')
      })
    }
  }

  return (
    <AvatarsList>
      <Wrapper totalAvatarCount={totalAvatarCount}>
        {visibleAvatars.map((teamMember) => {
          return (
            <ItemBlock key={`dbAvatar${teamMember.id}`}>
              <ErrorBoundary>
                <DashboardAvatar teamMember={teamMember} />
              </ErrorBoundary>
            </ItemBlock>
          )
        })}
        {overflowCount > 0 && (
          <ItemBlock onClick={handleClickOverflow}>
            <OverflowWrapper>
              <OverflowCount>{`+${overflowCount}`}</OverflowCount>
            </OverflowWrapper>
          </ItemBlock>
        )}
      </Wrapper>
      <Label>Manage Team</Label>
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
