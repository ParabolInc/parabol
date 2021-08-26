import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {Breakpoint, ElementWidth} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleManageTeamMutation from '../../mutations/ToggleManageTeamMutation'
import {PALETTE} from '../../styles/paletteV3'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import ErrorBoundary from '../ErrorBoundary'
import DashboardAvatar from './DashboardAvatar'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const AvatarsList = styled('div')<{maxAvatars: number}>(({maxAvatars}) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: 16,
  flexDirection: 'column',
  [desktopBreakpoint]: {
    marginTop: 0,
    maxWidth: `${ElementWidth.DASHBOARD_AVATAR * maxAvatars}px`
  }
}))

const ScrollContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden'
})

const ItemBlock = styled('div')({
  marginRight: 8,
  position: 'relative',
  [desktopBreakpoint]: {
    display: 'flex',
    alignItems: 'flex-start',
    marginRight: 0
  }
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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const avatarsRef = useRef<HTMLDivElement>(null)
  // useAvatarsOverflow(wrapperRef, avatarsRef)
  const maxAvatars = 10 // adjust for screen widths
  const overflowCount = teamMembers.length > maxAvatars ? teamMembers.length - maxAvatars + 1 : 0
  const visibleAvatars = overflowCount === 0 ? teamMembers : teamMembers.slice(0, maxAvatars - 1)
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
    <AvatarsList maxAvatars={maxAvatars} ref={wrapperRef}>
      <ScrollContainer ref={avatarsRef}>
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
            <OverflowCount>{`+${overflowCount}`}</OverflowCount>
          </ItemBlock>
        )}
      </ScrollContainer>
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
