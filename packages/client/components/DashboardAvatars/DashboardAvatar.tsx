import {DashboardAvatar_teamMember} from '../../__generated__/DashboardAvatar_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../Avatar/Avatar'
import {MenuPosition} from '../../hooks/useCoords'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {PALETTE} from '../../styles/paletteV3'
import {ElementWidth} from '../../types/constEnums'
import useTooltip from '../../hooks/useTooltip'
import useMutationProps from '../../hooks/useMutationProps'
import useAtmosphere from '../../hooks/useAtmosphere'
import ToggleManageTeamMutation from '../../mutations/ToggleManageTeamMutation'

interface Props {
  teamMember: DashboardAvatar_teamMember
}

const AvatarWrapper = styled('div')({
  width: 20
})

const StyledAvatar = styled(Avatar)<{isConnected: boolean; picture: string}>(
  ({isConnected, picture}) => ({
    // opacity causes transparency making overlap look bad. change img instead
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
  const {teamMember} = props
  const {picture, teamId} = teamMember
  const {user} = teamMember
  if (!user) {
    throw new Error(`User Avatar unavailable. ${JSON.stringify(teamMember)}`)
  }
  const {isConnected, preferredName} = user
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const handleClick = () => {
    closeTooltip()
    if (!submitting) {
      submitMutation()
      ToggleManageTeamMutation(atmosphere, {teamId}, {onError, onCompleted})
    }
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

export default createFragmentContainer(DashboardAvatar, {
  teamMember: graphql`
    fragment DashboardAvatar_teamMember on TeamMember {
      ...TeamMemberAvatarMenu_teamMember
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
      picture
      teamId
      user {
        isConnected
        preferredName
      }
    }
  `
})
