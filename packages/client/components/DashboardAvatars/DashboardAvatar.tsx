import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {DashboardAvatar_teamMember$key} from '../../__generated__/DashboardAvatar_teamMember.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {MenuPosition} from '../../hooks/useCoords'
import useMutationProps from '../../hooks/useMutationProps'
import useTooltip from '../../hooks/useTooltip'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {ElementWidth} from '../../types/constEnums'
import Avatar from '../Avatar/Avatar'

interface Props {
  teamMember: DashboardAvatar_teamMember$key
}

const AvatarWrapper = styled('div')({
  width: ElementWidth.DASHBOARD_AVATAR_OVERLAPPED
})

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
        teamId
        user {
          picture
          preferredName
          isConnected
        }
      }
    `,
    teamMemberRef
  )
  const {id: teamMemberId, teamId} = teamMember
  const {user} = teamMember
  if (!user) {
    throw new Error(`User Avatar unavailable. ${JSON.stringify(teamMember)}`)
  }
  const {isConnected, preferredName, picture} = user
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
      <Avatar
        onClick={handleClick}
        picture={picture}
        ref={originRef}
        className={`h-7 w-7 border-2 border-solid border-slate-200 after:absolute after:h-full after:w-full after:content-[""] hover:after:bg-white/30 ${!isConnected && 'after:bg-white/60'}`}
      />
      {tooltipPortal(preferredName)}
    </AvatarWrapper>
  )
}

export default DashboardAvatar
