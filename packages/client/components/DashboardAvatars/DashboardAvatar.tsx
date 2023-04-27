import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '../../hooks/useAtmosphere'
import {MenuPosition} from '../../hooks/useCoords'
import useMutationProps from '../../hooks/useMutationProps'
import useTooltip from '../../hooks/useTooltip'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../styles/paletteV3'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {ElementWidth} from '../../types/constEnums'
import {DashboardAvatar_teamMember$key} from '../../__generated__/DashboardAvatar_teamMember.graphql'
import Avatar from '../Avatar/Avatar'

interface Props {
  teamMember: DashboardAvatar_teamMember$key
}

const AvatarWrapper = styled('div')({
  width: ElementWidth.DASHBOARD_AVATAR_OVERLAPPED
})

const StyledAvatar = styled(Avatar)<{isConnected: boolean; picture: string}>(
  ({isConnected, picture}) => ({
    // opacity causes transparency making overlap look bad. use img instead
    backgroundImage: `${
      isConnected ? '' : 'linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)),'
    } url(${picture}), url(${defaultUserAvatar})`,
    border: `2px solid ${PALETTE.SLATE_200}`,
    ':hover': {
      backgroundImage: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)),
    url(${picture}), url(${defaultUserAvatar})`
    }
  })
)

const DashboardAvatar = (props: Props) => {
  const {teamMember: teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment DashboardAvatar_teamMember on TeamMember {
        ...TeamMemberAvatarMenu_teamMember
        ...LeaveTeamModal_teamMember
        ...PromoteTeamMemberModal_teamMember
        ...RemoveTeamMemberModal_teamMember
        id
        picture
        teamId
        preferredName
        user {
          isConnected
        }
      }
    `,
    teamMemberRef
  )
  const {id: teamMemberId, picture, teamId, preferredName} = teamMember
  const {user} = teamMember
  if (!user) {
    throw new Error(`User Avatar unavailable. ${JSON.stringify(teamMember)}`)
  }
  const {isConnected} = user
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const handleClick = () => {
    closeTooltip()
    if (submitting) return
    submitMutation()
    ToggleTeamDrawerMutation(
      atmosphere,
      {teamId, teamDrawerType: 'manageTeam'},
      {onError, onCompleted}
    )
    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      const teamMember = viewer?.getLinkedRecord('teamMember', {teamId})
      if (!teamMember) return
      teamMember.setValue(teamMemberId, 'manageTeamMemberId')
    })
  }

  return (
    <AvatarWrapper onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
      <StyledAvatar
        {...teamMember}
        isConnected={!!isConnected}
        onClick={handleClick}
        picture={picture || defaultUserAvatar}
        ref={originRef}
        size={ElementWidth.DASHBOARD_AVATAR}
      />
      {tooltipPortal(preferredName)}
    </AvatarWrapper>
  )
}

export default DashboardAvatar
