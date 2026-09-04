import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {DashboardAvatar_teamMember$key} from '../../__generated__/DashboardAvatar_teamMember.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import Avatar from '../Avatar/Avatar'

interface Props {
  teamMember: DashboardAvatar_teamMember$key
}

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

  const handleClick = () => {
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
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='w-5'>
          <Avatar
            onClick={handleClick}
            picture={picture}
            className={`h-7 w-7 border-2 border-surface-well border-solid after:absolute after:h-full after:w-full after:content-[""] hover:after:bg-white/30 ${!isConnected && 'after:bg-white/60'}`}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{preferredName}</TooltipContent>
    </Tooltip>
  )
}

export default DashboardAvatar
