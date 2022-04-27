import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {Breakpoint, ElementWidth} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../styles/paletteV3'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import AvatarList, {sizeToHeightBump} from '../AvatarList'
import PlainButton from '../PlainButton/PlainButton'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const Row = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  [desktopBreakpoint]: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  }
})

const Column = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  alignItems: 'center'
})

const AvatarsWrapper = styled('div')<{totalUsers: number}>(({totalUsers}) => ({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  // setting maxWidth allows to center avatars
  maxWidth: `${
    (totalUsers - 1) * ElementWidth.DASHBOARD_AVATAR_OVERLAPPED + ElementWidth.DASHBOARD_AVATAR
  }px`,
  // set minHeight to prevent vertical jump when switching between teams
  minHeight: ElementWidth.DASHBOARD_AVATAR + sizeToHeightBump[ElementWidth.DASHBOARD_AVATAR]
}))

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
  },
  marginTop: -sizeToHeightBump[ElementWidth.DASHBOARD_AVATAR] // coupling with AvatarList styles
})

interface Props {
  team: DashboardAvatars_team
}

type User = DashboardAvatars_team['teamMembers'][0]['user']

const DashboardAvatars = (props: Props) => {
  const rowRef = useRef<HTMLDivElement>(null)
  const {team} = props
  const {id: teamId, teamMembers} = team
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const sortedUsers = useMemo(() => {
    const connectedUsers = [] as User[]
    const offlineUsers = [] as User[]
    teamMembers.forEach((teamMember) => {
      const {user} = teamMember
      const {id: userId, isConnected} = user
      if (userId === viewerId) {
        connectedUsers.unshift(user)
      } else if (isConnected) {
        connectedUsers.push(user)
      } else {
        offlineUsers.push(user)
      }
    })
    return connectedUsers.concat(offlineUsers)
  }, [teamMembers])
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()

  const handleClick = (userId?: string) => {
    if (submitting) return
    submitMutation()
    ToggleTeamDrawerMutation(
      atmosphere,
      {teamId, teamDrawerType: 'manageTeam'},
      {onError, onCompleted}
    )
    if (!userId) return
    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      const teamMember = viewer?.getLinkedRecord('teamMember', {teamId})
      if (!teamMember) return
      const memberInFocus = teamMembers.find((teamMember) => teamMember.user.id === userId)
      if (!memberInFocus) return
      const {id: teamMemberId} = memberInFocus
      teamMember.setValue(teamMemberId, 'manageTeamMemberId')
    })
  }

  return (
    <Row ref={rowRef}>
      <Column>
        <AvatarsWrapper totalUsers={sortedUsers.length}>
          <AvatarList
            users={sortedUsers}
            containerRef={rowRef}
            size={ElementWidth.DASHBOARD_AVATAR}
            borderColor={PALETTE.SLATE_200}
            onOverflowClick={() => handleClick()}
            onUserClick={(userId) => handleClick(userId)}
          />
        </AvatarsWrapper>
        <StyledButton onClick={() => handleClick()}>Manage Team</StyledButton>
      </Column>
    </Row>
  )
}

graphql`
  fragment DashboardAvatars_teamMember on TeamMember {
    ...TeamMemberAvatarMenu_teamMember
    ...LeaveTeamModal_teamMember
    ...PromoteTeamMemberModal_teamMember
    ...RemoveTeamMemberModal_teamMember
    id
    preferredName
    user {
      ...AvatarList_users
      id
      isConnected
    }
  }
`

export default createFragmentContainer(DashboardAvatars, {
  team: graphql`
    fragment DashboardAvatars_team on Team {
      id
      teamMembers(sortBy: "preferredName") {
        ...AddTeamMemberAvatarButton_teamMembers
        ...DashboardAvatars_teamMember
        id
        preferredName
        user {
          ...AvatarList_users
          id
          isConnected
        }
      }
    }
  `
})
