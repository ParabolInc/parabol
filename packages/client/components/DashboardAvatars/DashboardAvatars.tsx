import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Breakpoint, ElementHeight, ElementWidth} from '~/types/constEnums'
import fromTeamMemberId from '~/utils/relay/fromTeamMemberId'
import useAtmosphere from '../../hooks/useAtmosphere'
import useBreakpoint from '../../hooks/useBreakpoint'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../styles/paletteV3'
import {
  DashboardAvatars_team$key,
  DashboardAvatars_team
} from '../../__generated__/DashboardAvatars_team.graphql'
import ErrorBoundary from '../ErrorBoundary'
import PlainButton from '../PlainButton/PlainButton'
import DashboardAvatar from './DashboardAvatar'

const AvatarsList = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  flexDirection: 'column',
  marginRight: 6,
  position: 'relative',
  // AvatarsWrapper left causes avatars to move into left padding on mobile by 4px (-2px for the transparent border)
  left: isDesktop ? 0 : 2
}))

const AvatarsWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  left: -4 // each avatar is given 20px of width but the final avatar uses 28px
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
  height: ElementHeight.DASHBOARD_AVATAR,
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
  height: 16,
  lineHeight: '16px',
  fontWeight: 600,
  color: PALETTE.SLATE_700,
  textAlign: 'center',
  width: '100%',
  WebkitTapHighlightColor: 'transparent',
  '&:hover': {
    cursor: 'pointer'
  }
})

interface Props {
  team: DashboardAvatars_team$key
}

type Avatar = DashboardAvatars_team['teamMembers'][0]

const DashboardAvatars = (props: Props) => {
  const {team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment DashboardAvatars_team on Team {
        id
        teamMembers(sortBy: "preferredName") {
          ...AddTeamMemberAvatarButton_teamMembers
          ...DashboardAvatar_teamMember
          id
          preferredName
          user {
            isConnected
          }
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers} = team
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const maxAvatars = isDesktop ? 10 : 6
  const overflowCount = teamMembers.length > maxAvatars ? teamMembers.length - maxAvatars + 1 : 0
  const sortedAvatars = useMemo(() => {
    const connectedAvatars = [] as Avatar[]
    const offlineAvatars = [] as Avatar[]
    teamMembers.forEach((avatar) => {
      const {id: teamMemberId, user} = avatar
      const {isConnected} = user
      const {userId} = fromTeamMemberId(teamMemberId)
      if (userId === viewerId) {
        connectedAvatars.unshift(avatar)
      } else if (isConnected) {
        connectedAvatars.push(avatar)
      } else {
        offlineAvatars.push(avatar)
      }
    })
    const sortedAvatars = connectedAvatars.concat(offlineAvatars)
    return overflowCount === 0 ? sortedAvatars : sortedAvatars.slice(0, maxAvatars - 1)
  }, [teamMembers])
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()

  const handleClick = (clickedOverflow: boolean) => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: 'manageTeam'},
        {onError, onCompleted}
      )
      commitLocalUpdate(atmosphere, (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        const teamMember = viewer?.getLinkedRecord('teamMember', {teamId})
        const memberInFocus = teamMembers[clickedOverflow ? maxAvatars - 1 : 0]
        if (!teamMember || !memberInFocus) return
        const {id: teamMemberId} = memberInFocus
        teamMember.setValue(teamMemberId, 'manageTeamMemberId')
      })
    }
  }

  return (
    <AvatarsList isDesktop={isDesktop}>
      <AvatarsWrapper>
        {sortedAvatars.map((teamMember) => {
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
      </AvatarsWrapper>
      <StyledButton onClick={() => handleClick(false)}>Manage Team</StyledButton>
    </AvatarsList>
  )
}

export default DashboardAvatars
