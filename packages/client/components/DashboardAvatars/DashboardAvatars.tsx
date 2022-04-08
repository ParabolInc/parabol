import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {ElementWidth} from '~/types/constEnums'
import fromTeamMemberId from '~/utils/relay/fromTeamMemberId'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../styles/paletteV3'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import AvatarList, {sizeToHeightBump} from '../AvatarList'
import PlainButton from '../PlainButton/PlainButton'

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  alignItems: 'center'
})

const AvatarsWrapper = styled('div')<{totalAvatars: number}>(({totalAvatars}) => ({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  minWidth: `${
    Math.min(totalAvatars - 1, 2) * ElementWidth.DASHBOARD_AVATAR_OVERLAPPED +
    ElementWidth.DASHBOARD_AVATAR
  }px`
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
  marginTop: sizeToHeightBump[ElementWidth.DASHBOARD_AVATAR] * -1 // coupling with AvatarList styles
})

interface Props {
  team: DashboardAvatars_team
}

type Avatar = DashboardAvatars_team['teamMembers'][0]['user']

const DashboardAvatars = (props: Props) => {
  const {team} = props
  const {id: teamId, teamMembers} = team
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const sortedAvatars = useMemo(() => {
    const connectedAvatars = [] as Avatar[]
    const offlineAvatars = [] as Avatar[]
    teamMembers.forEach((avatar) => {
      const {id: teamMemberId, user} = avatar
      const {isConnected} = user
      const {userId} = fromTeamMemberId(teamMemberId)
      if (userId === viewerId) {
        connectedAvatars.unshift(avatar.user)
      } else if (isConnected) {
        connectedAvatars.push(avatar.user)
      } else {
        offlineAvatars.push(avatar.user)
      }
    })
    const sortedAvatars = connectedAvatars.concat(offlineAvatars)
    return sortedAvatars
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
      const memberInFocus = teamMembers.find((x) => x.user.id === userId)
      if (!memberInFocus) return
      const {id: teamMemberId} = memberInFocus
      teamMember.setValue(teamMemberId, 'manageTeamMemberId')
    })
  }

  return (
    <Wrapper>
      <AvatarsWrapper totalAvatars={sortedAvatars.length}>
        <AvatarList
          users={sortedAvatars}
          size={ElementWidth.DASHBOARD_AVATAR}
          borderColor={PALETTE.SLATE_200}
          onOverflowClick={() => handleClick()}
          onUserClick={(userId) => handleClick(userId)}
        />
      </AvatarsWrapper>
      <StyledButton onClick={() => handleClick()}>Manage Team</StyledButton>
    </Wrapper>
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
