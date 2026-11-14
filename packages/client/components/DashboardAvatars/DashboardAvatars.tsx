import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import fromTeamMemberId from '~/utils/relay/fromTeamMemberId'
import type {
  DashboardAvatars_team$data,
  DashboardAvatars_team$key
} from '../../__generated__/DashboardAvatars_team.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useBreakpoint from '../../hooks/useBreakpoint'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../mutations/ToggleTeamDrawerMutation'
import {cn} from '../../ui/cn'
import ErrorBoundary from '../ErrorBoundary'
import PlainButton from '../PlainButton/PlainButton'
import DashboardAvatar from './DashboardAvatar'

interface Props {
  team: DashboardAvatars_team$key
}

type Avatar = DashboardAvatars_team$data['teamMembers'][0]

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
    <div
      className={cn(
        'relative mr-1.5 flex flex-col',
        // AvatarsWrapper left causes avatars to move into left padding on mobile by 4px (-2px for the transparent border)
        isDesktop ? 'left-0' : 'left-[2px]'
      )}
    >
      {/* each avatar is given 20px of width but the final avatar uses 28px */}
      <div className='-left-1 relative flex justify-center'>
        {sortedAvatars.map((teamMember) => {
          return (
            <ErrorBoundary key={`dbAvatar${teamMember.id}`}>
              <DashboardAvatar teamMember={teamMember} />
            </ErrorBoundary>
          )
        })}
        {overflowCount > 0 && (
          <div className='w-5' onClick={() => handleClick(true)}>
            <div className='flex h-7 w-7 select-none items-center justify-center overflow-hidden rounded-full border-2 border-surface-well border-solid bg-sky-400 font-semibold text-white text-xs hover:cursor-pointer'>{`+${overflowCount}`}</div>
          </div>
        )}
      </div>
      <PlainButton
        className='h-4 w-full text-center font-semibold text-fg-primary text-xs leading-4 [-webkit-tap-highlight-color:transparent] hover:cursor-pointer'
        onClick={() => handleClick(false)}
      >
        Manage Team
      </PlainButton>
    </div>
  )
}

export default DashboardAvatars
